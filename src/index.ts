import express from "express";
import bodyParser from "body-parser";
import request from "request";
import fastXmlParser from "fast-xml-parser";
import path from "path";
import Datastore from "nedb";
import { masuo } from "./anago";


type Person = { 
    feed:{ 
        logo: string 
    } 

};

type Acccount = {
    host : string,
    id : string
    
}

type Avater = {
    host: string,
    id: string,
    sourceURL: string,
    img: any

}

async function getPerson(host: string, id: string): Promise<Person> {
    return new Promise((resolve, reject) => {
        request(`https://${host}/users/${id}.atom`, (err, response, body) => {
            if(err){
                reject(err);
    
            }
    
            const person = fastXmlParser.parse(body);
            resolve(person);
    
        });

    })

}

async function getImageFromUrl(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
        request({ url : url, encoding : null }, (err, response, body: Buffer) => {
            if(err){
                reject(err);
    
            }

            resolve(body.toString('base64'));
    
        });

    });

}

async function getAvatersFromDb(id: string, host: string): Promise<Avater[]>{
    return new Promise((resolve, reject) => {
        db.find({ id : id, host : host }, (err: Error, docs : Avater[]) => {
            if(err){
                reject(err);
            }

            resolve(docs);

        });

    });

}

async function getAvater(id: string, host: string): Promise<Avater> { 
    const avaters: Avater[] = await getAvatersFromDb(id, host);

    if(avaters.length){
        return avaters[0];


    } else {
        const person  = await getPerson(host, id);
        const imgUrl = person.feed.logo
        const image = await getImageFromUrl(imgUrl);

        const newAvater: Avater = { 
            id : id,
            host : host,
            sourceURL : imgUrl,
            img : image
            
        };

        await saveAvater(newAvater);
        return newAvater;

    }

}

async function saveAvater(avater: Avater) {
    await new Promise((resolve, reject) => {
        db.insert(avater, (err) => {
            if(err){
                reject(err);

            }

            resolve();

        });

    }); 

}

async function getAvaterImage(personId: string): Promise<string> {
    const [,id, host] = personId.split("@");
    return (await getAvater(id, host)).img;

}

const db: Datastore = new Datastore({
    filename : path.resolve(__dirname, "databases", "persons.db"),
    autoload : true,

});

const app = express();
app.use(bodyParser.json());

app.post('/', async (req, res) => {
    console.log(req.body);
    
    // id@host
    const id = req.body.person;
    const data = await getAvaterImage(id);
    res.send(data);
    
});

app.listen(2243, () => {
    console.log(masuo());

});
import fs from 'fs';
import express from "express";
import bodyParser from "body-parser";
import request from "request";
import fastXmlParser from "fast-xml-parser";
import path from "path";
import Datastore from "nedb";
import { masuo } from "./anago";


if (!fs.existsSync(path.resolve(__dirname, "icons"))) {
    fs.mkdirSync(path.resolve(__dirname, "icons"));

}

type Person = { 
    feed:{ 
        logo: string 
    } 

};

type Avater=  {
    host: string,
    id: string,
    logo: string

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

async function getImage(url: string) {
    return new Promise((resolve, reject) => {
        request({ url : url, encoding : null }, (err, response, body) => {
            if(err){
                reject(err);
    
            }

            resolve(body);
    
        });

    });

}

async function getAvaters(id: string, host: string): Promise<Avater[]>{
    return new Promise((resolve, reject) => {
        db.find({ id : id, host : host }, (err: Error, docs : Avater[]) => {
            if(err){
                reject(err);
            }

            resolve(docs);

        });

    });

}

async function getAvaterImage(personId: string): Promise<string> {
    const [,id, host] = personId.split("@");
    const pth = path.resolve(__dirname ,"icons", personId);
    let imgPth = "";

    const avaters: Avater[] = await getAvaters(id, host);

    if(avaters.length <= 0){
        await new Promise((resolve, reject) => {
            fs.mkdir(pth, (err) => {
                    resolve();

            });

        });

        const person  = await getPerson(host, id);
        const imgUrl = person.feed.logo
        const image = await getImage(imgUrl);

        const logoTitle = imgUrl.split('/').slice(-1)[0];

        await new Promise((resolve, reject) => {
            fs.writeFile( path.join(pth, logoTitle), image, { encoding : null } ,(err) => {
                if(err) {
                    reject(err);

                } 

                resolve();

            });

        });

        db.insert({
            host : host,
            id : id,
            logo : logoTitle
        
        });

        imgPth = logoTitle;

    } else {
        imgPth = avaters[0].logo;

    }

    const img: string = await new Promise((resolve, reject) => {
        fs.readFile(path.join(pth, imgPth), 'base64' , (err, data) => {
            if(err){
                reject(err);

            }

            resolve(data);
    
        });

    });

    return img;

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
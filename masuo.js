// ==UserScript==
// @name         Masuo
// @namespace    https://ebycow.net/
// @version      1.0
// @description  Devilish Miya :: Vie Aragaderro
// @homepage     https://github.com/Ebycow/masuo/
// @author       Ebycow <https://ebycow.net>
// @match        https://mastodon.social/*
// @grant        GM_xmlhttpRequest
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js
// ==/UserScript==

(function() {
    'use strict';
    console.log("[Masuo] 🧑🥚 Vya^~ umai");

    function getAvatersByArticle(article){
        const account__avatar = $(article).find(".account__avatar");

        // maybe boost
        if(! account__avatar.length){
            console.log($(article).find(".status__display-name").attr('href'));
            const overlayUser = $(article).find(".status__display-name").attr('href').split('/');
            return [
                // boost target
                {
                    element : $(article).find(".account__avatar-overlay-base"),
                    id : $(article).find(".display-name__account").text()
                },
                // booster
                {
                    element : $(article).find(".account__avatar-overlay-overlay"),
                    id : `${overlayUser[ overlayUser.length - 1 ]}@${overlayUser[ overlayUser.length - 2 ]}`
                }
                
            ];

        // default statuses
        } else {
            return [
                {
                    element : account__avatar,
                    id : $(article).find(".display-name__account").text()
                }

            ]

        }

    }

    function fixAvater(avater){
        GM_xmlhttpRequest({
            method : "POST",
            url : `http://localhost:2243`,
            headers : { "Content-Type": "application/json" },
            data : JSON.stringify({ person : avater.id }),
            onload : (response) => {
                // setImage
                avater.element.css({"background-image" : "url(data:image/png;base64,"+ response.responseText +")"});
                
            },
            onerror : (err) => {
                console.log("error");
                console.log(err);

            }

        });

    }

    window.addEventListener('load', () => {
        const localTimeline = $(".item-list").eq(0);

        const mutationObserver = new MutationObserver(records => {
            for(const record of records){
                // TODO: check button.load-more
                const article = record.addedNodes;

                const avaters = getAvatersByArticle(article);
                for (const avater of avaters) {
                    // missing check
                    if(avater.element.css("background-image").indexOf("/avatars/original/missing.png") >= 0){
                        fixAvater(avater);
        
                    }
        
                }

            }

        });

        mutationObserver.observe(localTimeline[0], {
            childList: true,

        });


        // first load
        localTimeline.find("article").each((index, element) => {
            const avaters = getAvatersByArticle(element);
            for (const avater of avaters) {
                // missing check
                if(avater.element.css("background-image").indexOf("/avatars/original/missing.png") >= 0){
                    fixAvater(avater);
    
                }
    
            }

        });

    });

})();
// ==UserScript==
// @name         皮皮一键爬取
// @namespace    http://tampermonkey.net/
// @version      2024-09-14
// @description  try to take over the world!
// @author       suxing
// @match        https://www.pipiads.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=pipiads.com
// @grant        none
// ==/UserScript==


function main(){
    new Promise((resolve)=>{
        console.log("pipiads-button1");
        setTimeout(()=>{
            resolve();
        },4000)
    }).then(()=>{
        let pageMain = document.querySelector(".main-container");
        console.log(pageMain)
        if(pageMain){
            const task1Button = document.createElement("button");
            task1Button.className = "button-test";
            task1Button.innerHTML = "任务1 小店爬取";
            styleButton(task1Button);
            task1Button.onclick=()=>{task1();}

            const task2Button = document.createElement("button");
            task2Button.className = "button-test";
            task2Button.innerHTML = "任务2 产品爬取";
            styleButton(task2Button);
            task2Button.onclick=()=>{task2();}


            var buttonContainer = document.createElement("div");
            buttonContainer.style.display = "flex";
            buttonContainer.style.justifyContent = "center";
            buttonContainer.style.alignItems = "center";
            buttonContainer.style.height = "100px";
            buttonContainer.appendChild(task1Button);
            buttonContainer.appendChild(task2Button);
            pageMain.parentNode.insertBefore(buttonContainer, pageMain);


        }
    })
}

function exportjson(data,taskname){
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    a.download = `${taskname}-${formattedDate}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
function task2(){
    new Promise((resolve)=>{
        console.log("pipiads-scraper test1");
        setTimeout(()=>{
            resolve();
        },700)
    }).then(()=>{
        new Promise((resolve)=>{
            window.scrollTo({
                top: 7000,
                behavior: "smooth"
            });
            setTimeout(()=>{
                resolve();
            },1000)
        }).then(()=>{
            new Promise((resolve)=>{
                window.scrollTo({
                    top: 14000,
                    behavior: "smooth"
                });
                setTimeout(()=>{
                    resolve();
                },1000)
            }).then(()=>{
                new Promise((resolve)=>{
                    window.scrollTo({
                        top: 21000,
                        behavior: "smooth"
                    });
                    setTimeout(()=>{
                        resolve();
                    },1000)
                }).then(()=>{
                    new Promise((resolve)=>{
                        window.scrollTo({
                            top: document.body.scrollHeight,
                            behavior: "smooth"
                        });
                        setTimeout(()=>{
                            resolve();
                        },700)
                    }).then(()=>{
                        let productlist=[];
                        document.querySelectorAll("ul.wt-block-grid>li.wt-block-grid__item").forEach(li=>{
                            let title=li.querySelector("a.title.a-link").innerText;
                            let url=li.querySelector("a.title.a-link").getAttribute("href");
                            let price=""
                            try{
                                price=li.querySelector(".price-box").innerText.replace(/[()]/g, "");
                            }catch{
                                price="";
                            }
                            let datablock=li.querySelector(".data-count");
                            var i=0;
                            let temp=[];
                            datablock.querySelectorAll(".item").forEach(item=>{
                                if(i==0){let thumb=item.querySelector(".value").innerText;temp.push(thumb)}
                                if(i==1){let ads=item.querySelector(".value").innerText;temp.push(ads)}
                                if(i==2){let increase=item.querySelector(".value").innerText;temp.push(increase)}
                                i++;
                            })
                            let products={
                                "title":title,
                                "url":url,
                                "price":price,
                                "thumb":temp[0],
                                "ads":temp[1],
                                "increase":temp[2],
                            }
                            productlist.push(products);

                        })
                        const productListJson = JSON.stringify(productlist, null, 2);
                        console.log(productListJson);
                        exportjson(productListJson,"task2");
                        window.scrollTo({
                            top: 0,
                            behavior: "smooth"
                        });
                    })
                })
            })
        })
    })
}

function task1(){
    new Promise((resolve)=>{
        console.log("pipiads-scraper test1");
        setTimeout(()=>{
            resolve();
        },700)
    }).then(()=>{
        new Promise((resolve)=>{
            window.scrollTo({
                top: 7000,
                behavior: "smooth"
            });
            setTimeout(()=>{
                resolve();
            },1000)
        }).then(()=>{
            new Promise((resolve)=>{
                window.scrollTo({
                    top: 14000,
                    behavior: "smooth"
                });
                setTimeout(()=>{
                    resolve();
                },1000)
            }).then(()=>{
                new Promise((resolve)=>{
                    window.scrollTo({
                        top: 21000,
                        behavior: "smooth"
                    });
                    setTimeout(()=>{
                        resolve();
                    },1000)
                }).then(()=>{
                    new Promise((resolve)=>{
                        window.scrollTo({
                            top: document.body.scrollHeight,
                            behavior: "smooth"
                        });
                        setTimeout(()=>{
                            resolve();
                        },700)
                    }).then(()=>{
                        let productlist=[];
                        document.querySelectorAll("ul.wt-block-grid>li.wt-block-grid__item").forEach(li=>{
                            let title=li.querySelector("a.title.a-link").innerText;
                            let url=li.querySelector("a.title.a-link").getAttribute("href");
                            let price=""
                            try{
                                price=li.querySelector("span.usdPrice").innerText.replace(/[()]/g, "");
                            }catch{
                                price=li.querySelector("strong.price").innerText;
                            }
                            let quantity=li.querySelector(".sales-value").innerText;
                            let datablock=li.querySelector(".data-count");
                            let adsblock=li.querySelector(".time-data-box");
                            var i=0;
                            let temp=[];
                            datablock.querySelectorAll(".item").forEach(item=>{
                                if(i==0){let ads=item.querySelector(".value").innerText;temp.push(ads)}
                                if(i==1){let thumb=item.querySelector(".value").innerText;temp.push(thumb)}
                                if(i==2){let thumbrate=item.querySelector(".value").innerText;temp.push(thumbrate)}
                                i++;
                            })
                            let temp1=[]
                            var i1=0
                            adsblock.querySelectorAll(".time-item").forEach(item=>{
                                if(i1==0){let starttime=item.querySelector("._value").innerText;temp1.push(starttime)}
                                if(i1==1){let endtime=item.querySelector("._value").innerText;temp1.push(endtime)}
                                if(i1==2){let nums=item.querySelector("._value").innerText;temp1.push(nums)}
                                i1++;

                            })
                            let products={
                                "title":title,
                                "url":url,
                                "price":price,
                                "quantity":quantity,
                                "ads":temp[0],
                                "thumb":temp[1],
                                "thumbrate":temp[2],
                                "starttime":temp1[0],
                                "endtime":temp1[1],
                                "adsnums":temp1[2]
                            }
                            productlist.push(products);

                        })
                        const productListJson = JSON.stringify(productlist, null, 2);
                        console.log(productListJson);
                        exportjson(productListJson,"task1");
                        window.scrollTo({
                            top: 0,
                            behavior: "smooth"
                        });
                    })
                })
            })
        })
    })
}
function styleButton(button) {
    button.style.padding = "7px 15px";
    button.style.margin = "5px";
    button.style.fontSize = "16px";
    button.style.backgroundColor = "#4CAF50";
    button.style.color = "white";
    button.style.border = "none";
    button.style.borderRadius = "5px";
    button.style.cursor = "pointer";
    button.style.boxShadow = "0px 4px 6px rgba(0, 0, 0, 0.1)";
    button.style.transition = "background-color 0.3s";
    button.onmouseover = function() {
        button.style.backgroundColor = "#45a049";
    };
    button.onmouseout = function() {
        button.style.backgroundColor = "#4CAF50";
    };
}




window.addEventListener("load",()=>{
    main();
},false)
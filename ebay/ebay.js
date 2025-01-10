// ==UserScript==
// @name         ebayscraper1
// @namespace    http://tampermonkey.net/
// @version      2024-10-14
// @description  try to take over the world!
// @author       suxing
// @match        https://sellercenter.io/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=ebay.com
// @grant        none
// ==/UserScript==


function main(){
    new Promise((resolve)=>{
        console.log("sc-test!");
        setTimeout(()=>{
            resolve();
        },2000)
    }).then(()=>{
        let pageMain = document.querySelector(".el-table__header-wrapper");
        console.log(pageMain)
        if(pageMain){
            let button = document.createElement("button");
            button.className="button-test"
            button.innerHTML = "点击爬取json";
            button.style.padding = "10px 20px";
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
            button.onclick=()=>{scrapefunc();}
            var buttonContainer = document.createElement("div");
            buttonContainer.style.display = "flex";
            buttonContainer.style.justifyContent = "center";
            buttonContainer.style.alignItems = "center";
            buttonContainer.style.height = "100px"; // 调整高度以便更好地居中
            buttonContainer.appendChild(button);

            // 在 pageMain 元素的上方插入按钮
            pageMain.parentNode.insertBefore(buttonContainer, pageMain);
        }
    })
}

function exportjson(data){
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    a.download = `ebay${formattedDate}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
function scrapefunc(){
    new Promise((resolve)=>{
        console.log("ebay-scraper test1");
        setTimeout(()=>{
            resolve();
        },1000)
    }).then(()=>{
        new Promise((resolve)=>{
            window.scrollTo({
                top: 2000,
                behavior: "smooth"
            });
            setTimeout(()=>{
                resolve();
            },1000)
        }).then(()=>{
            let productlist=[];
            document.querySelectorAll(".el-table__row ").forEach(li=>{
                let title=li.querySelector(".productNameNew").innerText;

                let price=li.querySelector(".priceShow").innerText
                let cate=li.querySelector(".el-tooltip__trigger").innerText
                let quantity=""
                try{
                    quantity=li.querySelector(".cell>span").innerText;
                }catch{
                    quantity="不显示"
                }
                let info =""
                try{
                    info=li.querySelector(".viewLabel").innerText;

                }
                catch{
                    shipping="不显示"
                }


                let products={
                    "title":title,
                    "cate":cate,
                    "price":price,
                    "quantity":quantity,
                    "info":info,

                }
                productlist.push(products);
                })
                const productListJson = JSON.stringify(productlist, null, 2);
                console.log(productListJson);
                exportjson(productListJson);
                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });
            })

        })
}





window.addEventListener("load",()=>{
    main();

},false)
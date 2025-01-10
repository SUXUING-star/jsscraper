// ==UserScript==
// @name         视频分析页面爬虫
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  爬取视频分析页面的内容并下载为JSON文件
// @match        https://video.microdata-inc.com/*
// @grant        none
// ==/UserScript==



(function() {
    'use strict';



    // 使用文本内容找到元素的辅助函数
    function findElementByText(text, selector = 'div') {
        return Array.from(document.querySelectorAll(selector))
            .find(el => el.textContent?.trim() === text);
    }

    // 等待元素出现的辅助函数
    function waitForElement(selector, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();

            const checkElement = () => {
                const element = document.querySelector(selector);
                if (element) {
                    resolve(element);
                } else if (Date.now() - startTime > timeout) {
                    reject(new Error(`${timeout}ms后未找到元素 ${selector}`));
                } else {
                    setTimeout(checkElement, 100);
                }
            };

            checkElement();
        });
    }


    // 爬取原始脚本内容
    function scrapeOriginalScript() {
        // 找到包含"脚本裂变"的tab内容区域下的所有文本内容
        const allElements = document.querySelectorAll('div');
        let scriptContent = '';

        // 遍历所有元素，找到包含原始脚本的元素
        for (const element of allElements) {
            // 如果元素的直接文本内容是"原始脚本"
            if (element.childNodes.length === 1 &&
                element.textContent?.trim() === '原始脚本') {
                // 向后找到第一个非空的兄弟元素
                let nextSibling = element.nextElementSibling;
                while (nextSibling) {
                    const content = nextSibling.textContent?.trim();
                    if (content) {
                        scriptContent = content;
                        break;
                    }
                    nextSibling = nextSibling.nextElementSibling;
                }
                break;
            }
        }

        return {
            原始脚本: scriptContent,
            分镜列表: [] // 如果需要表格内容再加
        };
    }

    // 爬取评论分析内容
    function scrapeCommentAnalysis() {
        const result = {};
        // 使用类名定位标题元素
        const titles = document.querySelectorAll('.customCollapseTitleText___RdLrP');
        titles.forEach(title => {
            // 使用类名定位内容元素
            const content = title.nextElementSibling?.querySelectorAll('div');
            result[title.textContent?.trim()] = Array.from(content || [])
                .map(div => div.textContent?.trim())
                .filter(text => text && text !== '*');
        });
        return result;
    }

    // 爬取话术结构
    function scrapeSpeechStructure() {
        const allDivs = document.querySelectorAll('div');
        const structureContent = [];

        // 找到包含"话术结构"且其内容具有数字编号特征的元素
        for (const div of allDivs) {
            const text = div.textContent?.trim();
            // 匹配形如"1. **引发用户共鸣**："这样的内容
            if (text && /^\d+\.\s+\*\*.*\*\*：/.test(text)) {
                structureContent.push(text);
            }
        }

        return structureContent;
    }

    // 爬取表达技巧
    function scrapeExpressionTechniques() {
        const allDivs = document.querySelectorAll('div');
        const techniques = [];
        let foundStart = false;

        for (const div of allDivs) {
            const text = div.textContent?.trim();

            // 当找到标志性开头时开始收集
            if (text === '好的，我来分析一下这条短视频的爆火逻辑以及营销和说服技巧：') {
                foundStart = true;
                continue;
            }

            // 收集带编号的技巧内容
            if (foundStart && text && /^\d+\.\s+.*/.test(text)) {
                techniques.push(text);
            }

            // 如果收集完5个技巧点就停止
            if (techniques.length === 5) {
                break;
            }
        }

        return techniques;
    }
    // 下载JSON文件
    function downloadJSON(data, filename) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // 主爬取函数
    async function scrapeAllContent() {
        const result = {};
        const button = document.querySelector('#scrapeButton');
        if (button) {
            button.textContent = '爬取中...';
            button.disabled = true;
        }

        try {
            // 脚本页
            await clickTab(1);
            const scriptData = scrapeOriginalScript();
            result.脚本内容 = scriptData;

            // 评论分析页
            await clickTab(2);
            result.评论分析 = scrapeCommentAnalysis();

            // 话术结构页
            await clickTab(3);
            result.话术结构 = scrapeSpeechStructure();

            // 表达技巧页
            await clickTab(4);
            result.表达技巧 = scrapeExpressionTechniques();

            // 下载文件
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            downloadJSON(result, `视频分析_${timestamp}.json`);

            console.log('爬取完成：', result);
        } catch (error) {
            console.error('爬取过程出错：', error);
            alert('爬取失败：' + error.message);
        }

        if (button) {
            button.textContent = '爬取内容';
            button.disabled = false;
        }
    }

    // 模拟标签页点击
    async function clickTab(tabIndex) {
        const tabSelector = `.ant-tabs-tab:nth-child(${tabIndex}) .ant-tabs-tab-btn`;
        const tab = await waitForElement(tabSelector);
        tab.click();
        // 等待内容加载
        await new Promise(resolve => setTimeout(resolve, 1000));
    }


    // 添加爬取按钮
    function addScrapeButton() {
        // 使用面包屑导航定位
        const breadcrumb = document.querySelector('nav.ant-breadcrumb');
        if (!breadcrumb) {
            console.log('未找到面包屑导航，2秒后重试');
            setTimeout(addScrapeButton, 2000);
            return;
        }

        // 检查按钮是否已存在
        if (document.querySelector('#scrapeButton')) {
            return;
        }

        // 将按钮添加到面包屑导航的父元素中
        const container = breadcrumb.parentElement;
        const button = document.createElement('button');
        button.id = 'scrapeButton';
        button.textContent = '爬取内容';
        button.className = 'ant-btn ant-btn-primary';
        button.style.marginLeft = '10px';
        button.onclick = scrapeAllContent;
        container.appendChild(button);
        console.log('成功添加爬取按钮');
    }


    // 初始化函数
    function initialize() {
        console.log('脚本开始初始化...');
        // 等待3秒后开始尝试添加按钮
        setTimeout(() => {
            console.log('开始尝试添加按钮...');
            addScrapeButton();

            // 每2秒检查一次按钮是否存在，如果不存在则重试
            const checkInterval = setInterval(() => {
                if (!document.querySelector('#scrapeButton')) {
                    console.log('按钮不存在，重试添加...');
                    addScrapeButton();
                } else {
                    console.log('按钮已存在，停止检查');
                    clearInterval(checkInterval);
                }
            }, 2000);

            // 30秒后停止重试
            setTimeout(() => {
                clearInterval(checkInterval);
                console.log('初始化完成');
            }, 30000);
        }, 3000);
    }

    // 监听页面加载完成事件
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }


})();
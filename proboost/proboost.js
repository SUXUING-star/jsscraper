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

    // ================ 辅助函数 ================
    function findElementByText(text, selector = 'div') {
        return Array.from(document.querySelectorAll(selector))
            .find(el => el.textContent?.trim() === text);
    }

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

    async function clickTab(tabIndex) {
        const tabs = document.querySelectorAll('[role="tab"]');
        if (tabs[tabIndex - 1]) {
            tabs[tabIndex - 1].click();
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    // ================ 详情页数据爬取函数 ================
    function scrapeOriginalScript() {
        const scriptDiv = findElementByText('原始脚本');
        let scriptContent = '';

        if (scriptDiv && scriptDiv.nextElementSibling) {
            scriptContent = scriptDiv.nextElementSibling.textContent?.trim() || '';
        }

        return {
            原始脚本: scriptContent,
            分镜列表: []
        };
    }

    function scrapeCommentAnalysis() {
        const result = {};
        const sections = document.querySelectorAll('.customCollapseTitleText___RdLrP');

        sections.forEach(section => {
            const title = section.textContent?.trim();
            const content = section.nextElementSibling?.querySelectorAll('div');
            if (title && content) {
                result[title] = Array.from(content)
                    .map(div => div.textContent?.trim())
                    .filter(text => text && text !== '*');
            }
        });

        return result;
    }

    function scrapeSpeechStructure() {
        return Array.from(document.querySelectorAll('div'))
            .map(div => div.textContent?.trim())
            .filter(text => text && /^\d+\.\s+\*\*.*\*\*：/.test(text));
    }

    function scrapeExpressionTechniques() {
        const techniques = [];
        let foundStart = false;

        document.querySelectorAll('div').forEach(div => {
            const text = div.textContent?.trim();

            if (text === '好的，我来分析一下这条短视频的爆火逻辑以及营销和说服技巧：') {
                foundStart = true;
                return;
            }

            if (foundStart && text && /^\d+\.\s+.*/.test(text)) {
                techniques.push(text);
            }
        });

        return techniques.slice(0, 5);
    }

    // ================ 列表页数据爬取函数 ================
    function getVideoBasicData(card) {
        const data = {
            点赞数: '',
            播放量: '',
            互动率: ''
        };

        const stats = Array.from(card.querySelectorAll('div')).reduce((acc, div) => {
            const next = div.nextElementSibling;
            if (next) {
                const type = next.textContent?.trim();
                if (['点赞数', '播放量', '互动率'].includes(type)) {
                    acc[type] = div.textContent?.trim();
                }
            }
            return acc;
        }, {});

        return { ...data, ...stats };
    }

    // ================ 主要爬取函数 ================
    async function scrapeAllContent() {
        const result = {};

        try {
            await clickTab(1);
            result.脚本内容 = scrapeOriginalScript();

            await clickTab(2);
            result.评论分析 = scrapeCommentAnalysis();

            await clickTab(3);
            result.话术结构 = scrapeSpeechStructure();

            await clickTab(4);
            result.表达技巧 = scrapeExpressionTechniques();

            return result;
        } catch (error) {
            console.error('详情爬取失败:', error);
            throw error;
        }
    }

    async function startBatchScraping() {
        const button = document.querySelector('#mainScrapeButton');
        button.textContent = '爬取中...';
        button.disabled = true;

        try {
            // 先收集所有视频的基础信息和链接
            const videoInfos = [];
            const container = document.querySelector('.ant-spin-container');
            const videoCards = container.querySelectorAll('.item___V0Hun');
            console.log(`找到 ${videoCards.length} 个视频待爬取`);

            // 第一步：收集所有视频的基础数据和链接
            for (let i = 0; i < videoCards.length; i++) {
                const card = videoCards[i];
                const analysisButton = card.querySelector('div[class*="text-[#165DFF]"]');

                // 先获取基础数据
                const basicData = {
                    序号: i + 1,
                    ...getVideoBasicData(card)
                };

                // 保存数据和链接
                if (analysisButton) {
                    analysisButton.click();
                    // 等待页面加载，获取URL
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    const currentUrl = window.location.href;
                    videoInfos.push({
                        basicData: basicData,
                        detailUrl: currentUrl
                    });

                    // 点击返回
                    const backButton = findElementByText('基于爆款视频裂变');
                    if (backButton) {
                        backButton.click();
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                }
            }

            console.log('基础数据收集完成，开始爬取详情');

            // 第二步：依次访问每个链接获取详细数据
            const allVideoData = [];
            for (let i = 0; i < videoInfos.length; i++) {
                const videoInfo = videoInfos[i];
                console.log(`开始爬取第 ${i + 1} 个视频的详细数据`);

                // 访问详情页
                window.location.href = videoInfo.detailUrl;
                await new Promise(resolve => setTimeout(resolve, 3000)); // 等待页面加载

                try {
                    const detailData = await scrapeAllContent();
                    // 合并基础数据和详细数据
                    const completeData = {
                        ...videoInfo.basicData,
                        ...detailData
                    };
                    allVideoData.push(completeData);
                } catch (error) {
                    console.error(`视频${i + 1}详情爬取失败:`, error);
                    // 即使失败也保存基础数据
                    allVideoData.push(videoInfo.basicData);
                }
            }

            // 保存所有数据
            downloadJSON(allVideoData, `爆款视频数据_${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
            console.log('所有视频爬取完成');

        } catch (error) {
            console.error('批量爬取失败:', error);
            alert('爬取失败: ' + error.message);
        }

        button.textContent = '批量爬取';
        button.disabled = false;
    }
    // ================ UI函数 ================
    function addMainScrapeButton() {
        const searchInput = Array.from(document.querySelectorAll('input'))
        .find(input => input.placeholder === '请输入视频关键词');

        if (!searchInput || document.querySelector('#mainScrapeButton')) {
            return;
        }

        const button = document.createElement('button');
        button.id = 'mainScrapeButton';
        button.textContent = '批量爬取';
        button.className = 'ant-btn ant-btn-primary';
        Object.assign(button.style, {
            marginLeft: '20px',
            fontSize: '14px',
            height: '32px',
            padding: '4px 15px',
            borderRadius: '6px',
            backgroundColor: '#165DFF',
            color: '#ffffff',
            border: 'none',
            cursor: 'pointer'
        });

        button.onclick = startBatchScraping;
        searchInput.closest('.ant-input-group-wrapper').parentElement.appendChild(button);
    }

    // ================ 初始化 ================
    function initialize() {
        console.log('脚本初始化中...');
        setTimeout(() => {
            addMainScrapeButton();
            window.scrapeAllContent = scrapeAllContent;

            const interval = setInterval(() => {
                if (!document.querySelector('#mainScrapeButton')) {
                    addMainScrapeButton();
                }
            }, 2000);

            setTimeout(() => clearInterval(interval), 30000);
        }, 5000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
})();
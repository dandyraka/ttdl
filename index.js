import puppeteer from 'puppeteer'
import inquirer from 'inquirer'
import fs from 'fs-extra'
import axios from 'axios'
import chalk from 'chalk'

(async () => {
    const browser = await puppeteer.launch({
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--aggressive-cache-discard',
            '--disable-cache',
            '--disable-application-cache',
            '--disable-offline-load-stale-cache',
            '--disk-cache-size=0',
            '--incognito',
        ]
    });

    const info = chalk.hex('#FFFF00');
    console.log(chalk.green('Tiktok Mass Download - No Watermark'));
    console.log(info("by xtrvts"));
    console.log(`===================================`);
    const username = await inquirer
        .prompt([{
            name: 'tiktokTarget',
            message: 'Target username?'
        }, ])
        .then(answers => {
            return answers.tiktokTarget;
        });
    const [page] = await browser.pages();
    page.setDefaultNavigationTimeout(0);
    await page.goto(`https://www.tiktok.com/@${username}`, {waitUntil: 'networkidle2'});
    await page.setViewport({
        width: 1200,
        height: 800
    });
    
    console.log(info(`Get tiktok videos from @${username}`));
    console.log(info("Getting all videos..."));
    await autoScroll(page);
    console.log(chalk.green("Done!"));
    let media = await page.$x('//*[@id="app"]/div[2]/div[2]/div/div[2]/div[2]/div/div')
    console.log(chalk.green("\nTotal videos:", media.length));
    if (!fs.existsSync(`videos`)) fs.mkdirSync(`videos`)
    if (!fs.existsSync(`videos/${username}`)) fs.mkdirSync(`videos/${username}`)
    for (let i = 1; i <= media.length; i++) {
        const link = await page.evaluate(el => el.href, (await page.$x(`//*[@id="app"]/div[2]/div[2]/div/div[2]/div[2]/div/div[${i}]/div[1]/div/div/a`))[0])
        console.log(`[${i}] ${link}`)
        let filename = link.split("/").pop()+".mp4";
        let getNowm = await axios.get(`https://server1.majhcc.xyz/api/tk?url=${link}`).then(resp => {
            if(resp.data.success) return resp.data.link;
        });
        if(getNowm){
            await axios.get(getNowm, {
                responseType: "stream"
            })
            .then(response => {
                response.data.pipe(fs.createWriteStream(`videos/${username}/${filename}`));
                console.log(chalk.green(`[+] Download successfully (${filename})\n`));
            })
            .catch(error => {
                console.log(chalk.red("[!] Failed to download video.\n"));
                console.log(error);
            });
        } else {
            console.log(chalk.red("[!] Failed to get video link without watermark.\n"));
        }
    }
    await browser.close();
})();

async function autoScroll(page){
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            var totalHeight = 0;
            var distance = 100;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if(totalHeight >= scrollHeight){
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}
import puppeteer from "puppeteer";
import { URL, URLSearchParams } from "url";
import { config } from "../init";

let browser: puppeteer.Browser;

export async function createBrowser(): Promise<void> {
	browser = await puppeteer.launch( {
		headless: true,
		args: [
			"--no-sandbox",
			"--disable-setuid-sandbox",
			"--disable-dev-shm-usage"
		]
	} );
}

function getURL( target: string, params?: any ): string {
	const paramStr: string = new URLSearchParams( params ).toString();
	
	try {
		new URL( target );
		return target + "?" + paramStr;
	} catch ( e ) {
		const url: string = `http://localhost:${ config.serverPort }/views/${ target }.html`;
		return url + "?" + paramStr;
	}
}

export async function render(
	target: string,
	params: any = {},
	selector: string = "#app",
	cqCode: boolean = true
): Promise<string> {
	const url: string = getURL( target, params );
	
	const page: puppeteer.Page = await browser.newPage();
	await page.goto( url );
	const htmlElement = await page.$( selector );
	const result = <string>await htmlElement?.screenshot( {
		encoding: "base64"
	} );
	const base64: string = "base64://" + result;
	
	await page.close();
	if ( cqCode ) {
		return `[CQ:image,file=${ base64 }]`;
	}
	return base64;
}
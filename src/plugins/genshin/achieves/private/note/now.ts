import bot from "ROOT";
import { Private } from "#genshin/module/private/main";
import { NoteService } from "#genshin/module/private/note";
import { InputParameter } from "@modules/command";
import { RenderResult } from "@modules/renderer";
import { privateClass, renderer } from "#genshin/init";

async function getNowNote( userID: number ): Promise<string[]> {
	const accounts: Private[] = privateClass.getUserPrivateList( userID );
	if ( accounts.length === 0 ) {
		return [ "你还未订阅过任何账号" ];
	}
	
	const imageList: string[] = [];
	for ( let a of accounts ) {
		const data: string = await a.services[ NoteService.FixedField ].toJSON();
		const uid: string = a.setting.uid;
		
		const dbKey: string = `silvery-star.note-temp-${ uid }`;
		await bot.redis.setString( dbKey, data );
		const res: RenderResult = await renderer.asCqCode(
			"/note.html", { uid }
		);
		if ( res.code === "ok" ) {
			imageList.push( res.data );
		} else {
			bot.logger.error( res.error );
			imageList.push( "图片渲染异常，请联系持有者进行反馈" );
		}
	}
	return imageList;
}

export async function main( { sendMessage, messageData }: InputParameter ): Promise<void> {
	const userID: number = messageData.user_id;
	const res: string[] = await getNowNote( userID );
	
	for ( let msg of res ) {
		await sendMessage( msg );
	}
}
import { InputParameter } from "@modules/command";
import { NameResult, getRealName } from "../utils/name";
import { baseInfoPromise, characterInfoPromise, detailInfoPromise } from "../utils/promise";
import { render } from "../utils/render";

export async function main(
	{ sendMessage, messageData, redis, logger }: InputParameter
): Promise<void> {
	const qqID: number = messageData.user_id;
	const name: string = messageData.raw_message;
	
	/* 若用户在一小时内存在查询操作，则使用上一次操作的数据缓存 */
	let data: any = await redis.getHash( `silvery-star.card-data-${ qqID }` );
	
	/* 若无数据缓存，则尝试获取用户绑定的通行证，并通过其获取数据 */
	if ( data === null ) {
		const mysID: string | null = await redis.getString( `silvery-star.user-bind-id-${ qqID }` );
		if ( mysID !== null ) {
			try {
				const baseInfo = <[ number, string ]>await baseInfoPromise( qqID, parseInt( mysID ), redis );
				const detailInfo = <number[]>await detailInfoPromise( qqID, ...baseInfo, true, logger, redis );
				await characterInfoPromise( qqID, ...baseInfo, detailInfo, redis );
			} catch ( error ) {
				await sendMessage( <string>error );
				return;
			}
			data = await redis.getHash( `silvery-star.card-data-${ qqID }` );
		} else {
			await sendMessage( "请先通过通行证或UID查询自己的游戏信息" );
			return;
		}
	}
	data = JSON.parse( data.avatars );
	const result: NameResult = getRealName( name );
	if ( !result.definite || !data.some( el => el.name === result.info ) ) {
		await sendMessage( "查询失败，请检查角色名称是否正确或该用户是否拥有该角色" );
		return;
	}
	const image: string = await render(
		"character",
		{ qq: qqID, name: result.info }
	);
	await sendMessage( image );
}
import { Telegraf } from 'telegraf'
import { getArticle, getIvUrl, matchId } from './utils.js'

await import('dotenv').then((res) => res.config())

const { BOT_TOKEN } = process.env
if (!BOT_TOKEN) {
	throw Error('No env provided')
}

let bot = new Telegraf(BOT_TOKEN)

bot.catch(() => {})

bot.command('/start', (ctx) => {
	ctx.reply('Habr links, please')
})

bot.on('message', async (ctx) => {
	let { entities, text, message_id } = ctx.message as any

	if (entities) {
		for (let ent of entities) {
			if (ent.url) {
				text += '\n' + ent.url
			}
		}
	}

	let id = await matchId(text)

	if (id) {
		let article = await getArticle(id).catch(async (e) => {
			await ctx.reply('Error: ' + e.message, {
				reply_to_message_id: message_id
			})
			throw e
		})

		await ctx.reply(getIvUrl(id, article.etag), {
			reply_to_message_id: message_id
		})
	}
})

bot.on('inline_query', async (ctx) => {
	let id = await matchId(ctx.inlineQuery.query)

	let article = await getArticle(id).catch(async (e) => {
		await ctx.answerInlineQuery([], {
			switch_pm_parameter: 'not_found',
			switch_pm_text: 'Error: ' + e.message
		})
		throw e
	})

	await ctx.answerInlineQuery([
		{
			id: id!,
			type: 'article',
			title: article.titleHtml,
			thumb_url: article.metadata.shareImageUrl,
			description: article.metadata.metaDescription,
			input_message_content: {
				message_text: getIvUrl(id!, article.etag)
			}
		}
	])
})

if (process.env.NODE_ENV === 'production') {
	;(bot as any).startWebhook('/' + BOT_TOKEN)
}

bot.launch()

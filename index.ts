import { Telegraf } from 'telegraf'
import fetch from 'node-fetch'

await import('dotenv').then((res) => res.config())

const { BOT_TOKEN } = process.env
if (!BOT_TOKEN) {
	throw Error('No env provided')
}

let bot = new Telegraf(BOT_TOKEN)

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
		ctx
			.reply(getIvUrl(id), {
				reply_to_message_id: message_id
			})
			.catch((e) => e)
	}
})

bot.on('inline_query', async (ctx) => {
	let id = await matchId(ctx.inlineQuery.query)

	if (!id) {
		ctx
			.answerInlineQuery([], {
				switch_pm_parameter: 'not_found',
				switch_pm_text: 'No article found'
			})
			.catch((e) => e)
		return
	}

	let article = await getArticle(id)

	ctx
		.answerInlineQuery([
			{
				id,
				type: 'article',
				title: article.titleHtml,
				thumb_url: article.metadata.shareImageUrl,
				description: article.metadata.metaDescription,
				input_message_content: {
					message_text: getIvUrl(id)
				}
			}
		])
		.catch((e) => e)
})
bot.launch()

interface Article {
	id: string
	author: {
		alias: string
	}
	titleHtml: string
	textHtml: string
	metadata: {
		shareImageUrl: string
		metaDescription: string
	}
	tags: Array<{
		titleHtml: string
	}>
}

function getArticle(id: string): Promise<Article> {
	return fetch(`https://habr.com/kek/v2/articles/${id}`).then((res) => res.json()) as any
}

async function matchId(query: string) {
	let [match] = query.match(/amp\.gs\/\w+/) ?? []

	if (match) {
		query = await fetch('https://' + match).then((res) => res.url)
	}

	let [_, id] = query.match(/(?:geekr\.vercel\.app|habr\.com)\/.*?(\d+)/) ?? []

	return id
}

function getIvUrl(id: string) {
	return `https://a.devs.today/habr.com/p/${id}`
}

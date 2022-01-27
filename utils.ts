import fetch from 'node-fetch'

export interface Article {
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
	etag: string
}

export function getArticle(id?: string): Promise<Article> {
	if (!id) {
		throw Error('Not found')
	}
	return fetch(`https://habr.com/kek/v2/articles/${id}`).then(async (res) => {
		let article = (await res.json()) as Article
		if (res.status !== 200) {
			throw Error(res.statusText)
		}
		article.etag = res.headers.get('etag')?.slice(3, 7) ?? ''
		return article
	}) as any
}

export async function matchId(query: string) {
	let [match] = query.match(/amp\.gs\/\w+/) ?? []

	if (match) {
		query = await fetch('https://' + match).then((res) => res.url)
	}

	let [_, id] =
		query.match(/(?:geekr\.vercel\.app\/p|habr.com\/(?:.*\/blog|p|post))\/?(\d+)/) ??
		([] as [string?, string?])

	return id
}

export function getIvUrl(id: string, etag: string) {
	return `https://a.devs.today/habr.com/p/${id}${etag ? `?${etag}` : ''}`
}

import { matchId } from '../utils.js'
import { equal } from 'assert/strict'

describe('Url parser', () => {
	it('Allowed', async () => {
		let res = await Promise.all(
			[
				'geekr.vercel.app/p/1/',
				'geekr.vercel.app/post/1',
				'habr.com/ru/company/testComp123/blog/1/?utm_source=telegram',
				'habr.com/ru/article/1/',
				'habr.com/ru/news/t/1/',
				'habr.com/post/1/',
				'habr.com/ru/post/1/',
				'habr.com/p/1/',
				'habr.com/p/1'
			].map(matchId)
		)

		res.forEach((test) => equal(test, '1'))
	})

	it('Disallowed', async () => {
		let res = await Promise.all(['a.devs.today/habr.com/p/1'].map(matchId))

		res.forEach((test) => equal(test, undefined))
	})
})

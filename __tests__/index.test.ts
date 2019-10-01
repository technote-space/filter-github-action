import { Context } from '@actions/github/lib/context';
import { generateContext } from '@technote-space/github-action-test-helper';
import { isTargetEvent, isTargetLabels } from '../src';

export const targets = {
	'release': [
		'published',
		'rerequested',
	],
	'push': [
		(context: Context): boolean => /^refs\/tags\//.test(context.ref),
		'rerequested',
	],
	'pull_request': [
		[
			(context: Context): boolean => /^refs\/tags\//.test(context.ref),
			'rerequested',
		],
	],
	'project_card': '*',
};

const context = (event: string, action?: string, ref?: string): Context => generateContext({
	event,
	action,
	ref,
});

describe('isTargetEvent', () => {
	it('should return true 1', () => {
		expect(isTargetEvent(targets, context('release', 'published', undefined))).toBe(true);
	});

	it('should return true 2', () => {
		expect(isTargetEvent(targets, context('release', 'rerequested', undefined))).toBe(true);
	});

	it('should return true 3', () => {
		expect(isTargetEvent(targets, context('push', undefined, 'tags/v1.2.3'))).toBe(true);
	});

	it('should return true 4', () => {
		expect(isTargetEvent(targets, context('push', 'rerequested', undefined))).toBe(true);
	});

	it('should return true 5', () => {
		expect(isTargetEvent(targets, context('pull_request', 'rerequested', 'tags/v1.2.3'))).toBe(true);
	});

	it('should return true 6', () => {
		expect(isTargetEvent(targets, context('project_card', undefined, undefined))).toBe(true);
	});

	it('should return false 1', () => {
		expect(isTargetEvent(targets, context('release', 'created', undefined))).toBe(false);
	});

	it('should return false 2', () => {
		expect(isTargetEvent(targets, context('push', undefined, 'heads/v1.2.3'))).toBe(false);
	});

	it('should return false 3', () => {
		expect(isTargetEvent(targets, context('pull_request', 'created', 'tags/v1.2.3'))).toBe(false);
	});

	it('should return false 4', () => {
		expect(isTargetEvent(targets, context('pull_request', 'rerequested', 'heads/v1.2.3'))).toBe(false);
	});

	it('should return false 5', () => {
		expect(isTargetEvent(targets, context('label', undefined, undefined))).toBe(false);
	});
});

describe('isTargetLabels', () => {
	it('should return false if filed to get label', () => {
		expect(isTargetLabels([], [], context('push'))).toBe(false);
	});

	it('should return false if not included include target', () => {
		expect(isTargetLabels(['test1'], [], Object.assign(context('issues'), {
			payload: {
				issue: {
					labels: [{name: 'test2'}, {name: 'test3'}],
				},
			},
		}))).toBe(false);
	});

	it('should return false if included exclude target', () => {
		expect(isTargetLabels(['test1'], ['test2'], Object.assign(context('issues'), {
			payload: {
				issue: {
					labels: [{name: 'test1'}, {name: 'test2'}],
				},
			},
		}))).toBe(false);
	});

	it('should return true 1', () => {
		expect(isTargetLabels(['test1'], [], Object.assign(context('issues'), {
			payload: {
				issue: {
					labels: [{name: 'test1'}, {name: 'test2'}],
				},
			},
		}))).toBe(true);
	});

	it('should return true 2', () => {
		expect(isTargetLabels(['test1'], ['test2'], Object.assign(context('issues'), {
			payload: {
				issue: {
					labels: [{name: 'test1'}, {name: 'test3'}],
				},
			},
		}))).toBe(true);
	});

	it('should return true 3', () => {
		expect(isTargetLabels(['test1', 'test2', 'test3'], ['test4'], Object.assign(context('issues'), {
			payload: {
				issue: {
					labels: [{name: 'test2'}],
				},
			},
		}))).toBe(true);
	});

	it('should return true 4', () => {
		expect(isTargetLabels([], ['test2'], Object.assign(context('issues'), {
			payload: {
				issue: {
					labels: [{name: 'test1'}, {name: 'test3'}],
				},
			},
		}))).toBe(true);
	});

	it('should return correctly README test pattern', () => {
		expect(isTargetLabels([], [], Object.assign(context('issues'), {
			payload: {
				issue: {
					labels: [],
				},
			},
		}))).toBe(true);

		expect(isTargetLabels([], [], Object.assign(context('pull_request'), {
			payload: {
				'pull_request': {
					labels: [],
				},
			},
		}))).toBe(true);

		expect(isTargetLabels([], [], Object.assign(context('push'), {
			payload: {
				issue: {
					labels: [],
				},
			},
		}))).toBe(false);

		expect(isTargetLabels([], [], Object.assign(context('push'), {
			payload: {
				issue: {
					labels: [{name: 'label1'}],
				},
			},
		}))).toBe(false);

		expect(isTargetLabels(['label1'], [], Object.assign(context('issues'), {
			payload: {
				issue: {
					labels: [],
				},
			},
		}))).toBe(false);

		expect(isTargetLabels(['label1'], [], Object.assign(context('issues'), {
			payload: {
				issue: {
					labels: [{name: 'label1'}],
				},
			},
		}))).toBe(true);

		expect(isTargetLabels(['label1'], [], Object.assign(context('issues'), {
			payload: {
				issue: {
					labels: [{name: 'label1'}, {name: 'label2'}],
				},
			},
		}))).toBe(true);

		expect(isTargetLabels(['label1', 'label2'], [], Object.assign(context('issues'), {
			payload: {
				issue: {
					labels: [{name: 'label1'}],
				},
			},
		}))).toBe(true);

		expect(isTargetLabels([], ['label1'], Object.assign(context('issues'), {
			payload: {
				issue: {
					labels: [],
				},
			},
		}))).toBe(true);

		expect(isTargetLabels([], ['label1'], Object.assign(context('issues'), {
			payload: {
				issue: {
					labels: [{name: 'label1'}],
				},
			},
		}))).toBe(false);

		expect(isTargetLabels(['label1'], ['label2'], Object.assign(context('issues'), {
			payload: {
				issue: {
					labels: [{name: 'label1'}, {name: 'label2'}],
				},
			},
		}))).toBe(false);

		expect(isTargetLabels(['label1'], ['label3'], Object.assign(context('issues'), {
			payload: {
				issue: {
					labels: [{name: 'label1'}, {name: 'label2'}],
				},
			},
		}))).toBe(true);
	});
});

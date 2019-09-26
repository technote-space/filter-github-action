import { Context } from '@actions/github/lib/context';
import { getContext } from '@technote-space/github-action-test-helper';
import { isTargetEvent } from '../src';

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

const context = (event: string, action: string | null, ref: string | null): Context => getContext({
	eventName: event,
	payload: {
		action: action ? action : undefined,
	},
	ref: ref ? `refs/${ref}` : 'a',
});

describe('isTargetEvent', () => {
	it('should return true 1', () => {
		expect(isTargetEvent(targets, context('release', 'published', null))).toBeTruthy();
	});

	it('should return true 2', () => {
		expect(isTargetEvent(targets, context('release', 'rerequested', null))).toBeTruthy();
	});

	it('should return true 3', () => {
		expect(isTargetEvent(targets, context('push', null, 'tags/v1.2.3'))).toBeTruthy();
	});

	it('should return true 4', () => {
		expect(isTargetEvent(targets, context('push', 'rerequested', null))).toBeTruthy();
	});

	it('should return true 5', () => {
		expect(isTargetEvent(targets, context('pull_request', 'rerequested', 'tags/v1.2.3'))).toBeTruthy();
	});

	it('should return true 6', () => {
		expect(isTargetEvent(targets, context('project_card', null, null))).toBeTruthy();
	});

	it('should return false 1', () => {
		expect(isTargetEvent(targets, context('release', 'created', null))).toBeFalsy();
	});

	it('should return false 2', () => {
		expect(isTargetEvent(targets, context('push', null, 'heads/v1.2.3'))).toBeFalsy();
	});

	it('should return false 3', () => {
		expect(isTargetEvent(targets, context('pull_request', 'created', 'tags/v1.2.3'))).toBeFalsy();
	});

	it('should return false 4', () => {
		expect(isTargetEvent(targets, context('pull_request', 'rerequested', 'heads/v1.2.3'))).toBeFalsy();
	});

	it('should return false 5', () => {
		expect(isTargetEvent(targets, context('label', null, null))).toBeFalsy();
	});
});

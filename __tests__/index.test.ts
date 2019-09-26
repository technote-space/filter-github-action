import { Context } from '@actions/github/lib/context';
import { generateContext } from '@technote-space/github-action-test-helper';
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

const context = (event: string, action: string | undefined, ref: string | undefined): Context => generateContext({
	event,
	action,
	ref,
});

describe('isTargetEvent', () => {
	it('should return true 1', () => {
		expect(isTargetEvent(targets, context('release', 'published', undefined))).toBeTruthy();
	});

	it('should return true 2', () => {
		expect(isTargetEvent(targets, context('release', 'rerequested', undefined))).toBeTruthy();
	});

	it('should return true 3', () => {
		expect(isTargetEvent(targets, context('push', undefined, 'tags/v1.2.3'))).toBeTruthy();
	});

	it('should return true 4', () => {
		expect(isTargetEvent(targets, context('push', 'rerequested', undefined))).toBeTruthy();
	});

	it('should return true 5', () => {
		expect(isTargetEvent(targets, context('pull_request', 'rerequested', 'tags/v1.2.3'))).toBeTruthy();
	});

	it('should return true 6', () => {
		expect(isTargetEvent(targets, context('project_card', undefined, undefined))).toBeTruthy();
	});

	it('should return false 1', () => {
		expect(isTargetEvent(targets, context('release', 'created', undefined))).toBeFalsy();
	});

	it('should return false 2', () => {
		expect(isTargetEvent(targets, context('push', undefined, 'heads/v1.2.3'))).toBeFalsy();
	});

	it('should return false 3', () => {
		expect(isTargetEvent(targets, context('pull_request', 'created', 'tags/v1.2.3'))).toBeFalsy();
	});

	it('should return false 4', () => {
		expect(isTargetEvent(targets, context('pull_request', 'rerequested', 'heads/v1.2.3'))).toBeFalsy();
	});

	it('should return false 5', () => {
		expect(isTargetEvent(targets, context('label', undefined, undefined))).toBeFalsy();
	});
});

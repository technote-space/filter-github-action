import { getContext } from '@technote-space/github-action-test-helper';
import { describe, expect, it } from 'vitest';
import { getLabels } from './context.js';

describe('getLabels', () => {
  it('should return issue labels', () => {
    expect(getLabels(getContext({
      eventName: 'issues',
      payload: {
        issue: {
          labels: [
            {
              name: 'test1',
            },
            {
              name: 'test2',
            },
          ],
        },
      },
    }))).toEqual(['test1', 'test2']);
  });

  it('should return PR labels', () => {
    expect(getLabels(getContext({
      eventName: 'pull_request',
      payload: {
        'pull_request': {
          labels: [
            {
              name: 'test1',
            },
            {
              name: 'test2',
            },
          ],
        },
      },
    }))).toEqual(['test1', 'test2']);
    expect(getLabels(getContext({
      eventName: 'pull_request_target',
      payload: {
        'pull_request': {
          labels: [
            {
              name: 'test1',
            },
            {
              name: 'test2',
            },
          ],
        },
      },
    }))).toEqual(['test1', 'test2']);
  });

  it('should return false if issue is invalid', () => {
    expect(getLabels(getContext({
      eventName: 'issues',
      payload: {},
    }))).toBe(false);

    expect(getLabels(getContext({
      eventName: 'issues',
      payload: {
        issue: {},
      },
    }))).toBe(false);
  });

  it('should return false if PR is invalid', () => {
    expect(getLabels(getContext({
      eventName: 'pull_request',
      payload: {},
    }))).toBe(false);

    expect(getLabels(getContext({
      eventName: 'pull_request',
      payload: {
        'pull_request': {},
      },
    }))).toBe(false);
  });

  it('should return false if not valid event', () => {
    expect(getLabels(getContext({
      eventName: 'push',
    }))).toEqual([]);
  });
});

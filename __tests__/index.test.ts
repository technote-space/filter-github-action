import {Context} from '@actions/github/lib/context';
import {generateContext, testEnv} from '@technote-space/github-action-test-helper';
import {isTargetEvent, isTargetLabels} from '../src';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getTarget = (additional: { [key: string]: any } = {}): { [key: string]: any } => Object.assign({}, {
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
}, additional);

const context = (event: string, action?: string, ref?: string): Context => generateContext({
  event,
  action,
  ref,
});

describe('isTargetEvent', () => {
  testEnv();

  it('should return true 1', () => {
    expect(isTargetEvent(getTarget(), context('release', 'published', undefined))).toBe(true);
  });

  it('should return true 2', () => {
    expect(isTargetEvent(getTarget(), context('release', 'rerequested', undefined))).toBe(true);
  });

  it('should return true 3', () => {
    expect(isTargetEvent(getTarget(), context('push', undefined, 'refs/tags/v1.2.3'))).toBe(true);
  });

  it('should return true 4', () => {
    expect(isTargetEvent(getTarget(), context('push', 'rerequested', undefined))).toBe(true);
  });

  it('should return true 5', () => {
    expect(isTargetEvent(getTarget(), context('pull_request', 'rerequested', 'refs/tags/v1.2.3'))).toBe(true);
  });

  it('should return true 6', () => {
    expect(isTargetEvent(getTarget(), context('pull_request_target', 'rerequested', 'refs/tags/v1.2.3'))).toBe(true);
  });

  it('should return true 7', () => {
    expect(isTargetEvent(getTarget({'pull_request_target': '*'}), context('pull_request_target', 'rerequested', 'refs/tags/v1.2.3'), {notCheckPrTarget: true})).toBe(true);
  });

  it('should return true 8', () => {
    expect(isTargetEvent(getTarget(), context('project_card', undefined, undefined))).toBe(true);
  });

  it('should return true 9', () => {
    process.env.INPUT_IGNORE_CONTEXT_CHECK = 'true';
    expect(isTargetEvent(getTarget(), context('release', 'created', undefined))).toBe(true);
  });

  it('should return true 10', () => {
    expect(isTargetEvent(getTarget(), context('workflow_run', undefined, undefined))).toBe(true);
  });

  it('should return true 10', () => {
    expect(isTargetEvent(getTarget({'workflow_run': '*'}), context('workflow_run', undefined, undefined), {notCheckWorkflowRun: true})).toBe(true);
  });

  it('should return true 11', () => {
    expect(isTargetEvent(getTarget({'*': context => context.ref.startsWith('refs/heads/test')}), context('repository_dispatch', undefined, 'refs/heads/test/123'))).toBe(true);
  });

  it('should return false 1', () => {
    expect(isTargetEvent(getTarget(), context('release', 'created', undefined))).toBe(false);
  });

  it('should return false 2', () => {
    expect(isTargetEvent(getTarget(), context('push', undefined, 'refs/heads/v1.2.3'))).toBe(false);
  });

  it('should return false 3', () => {
    expect(isTargetEvent(getTarget(), context('pull_request', 'created', 'refs/tags/v1.2.3'))).toBe(false);
  });

  it('should return false 4', () => {
    expect(isTargetEvent(getTarget(), context('pull_request', 'rerequested', 'refs/heads/v1.2.3'))).toBe(false);
  });

  it('should return false 5', () => {
    expect(isTargetEvent(getTarget(), context('label', undefined, undefined))).toBe(false);
  });

  it('should return false 6', () => {
    expect(isTargetEvent(getTarget(), context('pull_request_target', 'rerequested', 'refs/tags/v1.2.3'), {notCheckPrTarget: true})).toBe(false);
  });

  it('should return false 7', () => {
    expect(isTargetEvent(getTarget(), context('workflow_run', undefined, undefined), {notCheckWorkflowRun: true})).toBe(false);
  });

  it('should return false 8', () => {
    expect(isTargetEvent(getTarget({'*': context => context.ref.startsWith('refs/heads/test')}), context('repository_dispatch', undefined, 'refs/heads/feature'))).toBe(false);
  });
});

describe('isTargetLabels', () => {
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

  it('should return false if failed to get labels', () => {
    expect(isTargetLabels(['test1'], ['test2'], Object.assign(context('issues'), {
      payload: {},
    }))).toBe(false);
  });

  it('should return true 1', () => {
    expect(isTargetLabels([], [], context('push'))).toBe(true);
  });

  it('should return true 2', () => {
    expect(isTargetLabels(['test1'], [], Object.assign(context('issues'), {
      payload: {
        issue: {
          labels: [{name: 'test1'}, {name: 'test2'}],
        },
      },
    }))).toBe(true);
  });

  it('should return true 3', () => {
    expect(isTargetLabels(['test1'], ['test2'], Object.assign(context('issues'), {
      payload: {
        issue: {
          labels: [{name: 'test1'}, {name: 'test3'}],
        },
      },
    }))).toBe(true);
  });

  it('should return true 4', () => {
    expect(isTargetLabels(['test1', 'test2', 'test3'], ['test4'], Object.assign(context('issues'), {
      payload: {
        issue: {
          labels: [{name: 'test2'}],
        },
      },
    }))).toBe(true);
  });

  it('should return true 5', () => {
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
    }))).toBe(true);

    expect(isTargetLabels([], [], Object.assign(context('issues'), {
      payload: {
        issue: {
          labels: [{name: 'label1'}],
        },
      },
    }))).toBe(true);

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

import { IGNORE } from '../../constants';
import { Persistence } from '../../persistence';

export const getAvailableMatchers = async () => {
  let matchers;

  matchers = await Persistence.matchers.modified.read();
  if (!matchers.length) {
    console.warn(`NO_MODIFIED_MATCHERS_USING_FINAL_MATCHERS`);
    matchers = await Persistence.matchers.final.read();
  }

  return matchers;
};

export const getUiMatchers = async () => {
  const matchers = await getAvailableMatchers();
  return matchers.map(i => ({
    id: i.id,
    category: i.category,
    query: i.query,
    markedForDelete: false
  }));
};

const TestMatchers = {
  'has-dash': 'has dash',
  'has number sign': 'has number sign',
  'has star': 'with removed asterisk',
  'website': 'contains .com',
  'some company.com': 'website with removed asterisk',
  'some_and_company': 'ampersand replacement',
  'override-category': 'overridden category',
  'ignore-test': IGNORE,
};
import { GraphQLAdmin } from './graphql-admin';

describe('app', () => {
  it('builds', () => {
    expect(new GraphQLAdmin()).toBeTruthy();
  });
});

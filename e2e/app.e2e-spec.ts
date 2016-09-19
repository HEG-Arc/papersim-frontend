import { PapersimPage } from './app.po';

describe('papersim App', function() {
  let page: PapersimPage;

  beforeEach(() => {
    page = new PapersimPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});

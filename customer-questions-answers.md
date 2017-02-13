Question 1:

Hi George,

Thank you for reaching out and choosing Algolia for your search needs. I'm happy to help explain. Let's start with a high-level:

Algolia search works by storing the items you'd like to search in an Algolia database in cloud, and by then providing you with tools to perform search queries against that data. The place in which we store your data is called the 'index', and each individual item that can appear as a search result is called a 'record'.

Think of the Algolia database as a paper book of English dictionary of words: the dictionary has an 'index' section, where the reader can quickly find the page number for a given word. When you access an Algolia index, you are in sense grabbing a copy of this dictionary index, in that you are receiving a tool that helps you find the specific data you need. Note there is a slight difference from the analogy here, in that we also refer to the place in which you store your Algolia data as the 'index' as well. The act of looking up an individual item in the index is known as 'indexing'.

This item can also be called a 'record', or even a 'search result'. In the dictionary analogy, an individual word (along with its associated definitions) would be a 'record'. So, you can think of a 'record' as being the unit of data you would expect to see or click on in a list of search results.

As for metrics to use in custom ranking: you should think about these as, "What data can I provide Algolia so it knows which results I'd like users to see first?" Good choices for custom ranking metrics/attributes are those that indicate popularity. So, number of likes, number of positive reviews, etc. This will tell Algolia which results should be sorted to the top so that your users see them first.

I hope that clears up some questions for you. Please don't hesitate to reach out again should you have any more questions or want additional clarification.

Thank you,
- Nathan Weir

Question 2:

Hi Matt,

Thank you for this feedback. We appreciate hearing honest opinions about changes like these as they help us know how to retarget and focus our priorities going forward.

I've sent your note along to the team, and we'll be sure to consider this issue as we continue enhancing the index management experience.

Please let me know if there's any way I can be of further assistance.

Thank you,
- Nathan Weir

<Note to assignment reviewers: Potentially suggest automating clearing/deletion of indexes via API calls? I'd need another pair of eyes to tell me if that's productive, as it doesn't solve the "this requires additional work" issue>

Question 3:

Hi Leo,

Thanks for reaching out and considering Algolia for your search needs.

I think you'll find moving to Algolia to be relatively quick and painless. But to have a better sense on the magnitude of development required, I'll need to have a better idea of your search needs. Would you mind describing the kinds of search features you're looking to support on your site? These could be things like search-as-you-type, pagination, search highlights, searching a large dataset, etc. Then, I can provide you with more information on how to accomplish each.

The high level process is essentially:
 * Sign up for an Algolia account. A 14-day free trial is available to help you get started.
 * Log in to the Algolia dashboard and upload your search results data an Algolia search index
 * Send a search query against the Algolia API from your website
    - Please see https://www.algolia.com/integrations for a list of environments supported
 * Format and display the results returned by the API

You can find a more detailed overview of the process at https://www.algolia.com/doc/guides/getting-started/how-it-works/. Additionally, this interactive tutorial (https://www.algolia.com/getstarted#) will give a time-friendly view of what's involved from a development perspective.

Please let me know if you have any additional questions. I'd be happy to help provide more information about your specific use case & choice of environment.

Thank you,
- Nathan Weir
# Volunteer / open_cc QA log schema

File: `volunteer-qa-log.json`

| Field           | Type                                     | Required          |
| --------------- | ---------------------------------------- | ----------------- |
| `gloss`         | string (HF id, e.g. `HELLO`)             | yes               |
| `reviewer`      | string                                   | yes               |
| `date`          | ISO date (`YYYY-MM-DD`)                  | yes               |
| `pass`          | boolean                                  | yes               |
| `releaseOnFile` | boolean                                  | yes for volunteer |
| `notes`         | string                                   | optional          |
| `sourceId`      | `volunteer-deaf` \| `popsign-cc-by` \| … | yes when binding  |

**Bind rule:** Tier B ingest rejects glosses without `qaPass: true`. Volunteer also requires `releaseOnFile: true`.

PopSign (`assist.popsign.v1`, default **off**): do not bind media bytes until every shipped gloss has a Deaf QA pass row here.

import { Injectable } from '@nestjs/common'

import { InjectOpensearchClient, OpensearchClient } from 'nestjs-opensearch'

@Injectable()
export class SearchService {
  constructor(
    @InjectOpensearchClient('default') private readonly opensearchService: OpensearchClient
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async search<T>(req: Record<string, any>): Promise<T[]> {
    const res = await this.opensearchService.search<T>(req)

    console.debug(res)

    return []
    // const hits = res.hits.hits
    // return hits.map((item) => item._source)
  }
}

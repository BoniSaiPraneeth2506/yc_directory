import { type SchemaTypeDefinition } from 'sanity'
import { author } from './author'
import { startup } from './startup'
import { playlist } from './playlist'
import { comment } from './comment'
import { notification } from './notification'
import { reel } from './reel'
import { conversation } from './conversation'
import { message } from './message'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [author,startup,playlist,comment,notification,reel,conversation,message],
}

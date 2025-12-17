import { type SchemaTypeDefinition } from 'sanity'
import secureFile from './file'


export const schema: { types: SchemaTypeDefinition[] } = {
  types: [secureFile],
}

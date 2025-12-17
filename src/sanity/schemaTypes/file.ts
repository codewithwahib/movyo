import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'secureFile',
  title: 'Secure File',
  type: 'document',
  fields: [
    defineField({
      name: 'password',
      title: 'Password',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'senderEmail',
      title: 'Sender Email',
      type: 'string',
      validation: Rule => Rule.required().email()
    }),
    defineField({
      name: 'receiverEmail',
      title: 'Receiver Email',
      type: 'string',
      validation: Rule => Rule.required().email()
    }),
    defineField({
      name: 'transferName',
      title: 'Transfer Name',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'message',
      title: 'Message',
      type: 'text',
    }),
    defineField({
      name: 'files',
      title: 'Files',
      type: 'array',
      of: [
        {
          type: 'file',
          fields: [
            {
              name: 'title',
              type: 'string',
              title: 'Title',
            },
            {
              name: 'size',
              type: 'number',
              title: 'Size (bytes)',
            },
            {
              name: 'fileType',
              type: 'string',
              title: 'File Type',
            }
          ]
        }
      ],
      validation: Rule => Rule.required().min(1)
    }),
    defineField({
      name: 'fileCount',
      title: 'File Count',
      type: 'number',
      initialValue: 0,
      validation: Rule => Rule.required().min(1)
    }),
    defineField({
      name: 'transferDate',
      title: 'Transfer Date',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'isDownloaded',
      title: 'Is Downloaded',
      type: 'boolean',
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: 'transferName',
      subtitle: 'senderEmail',
      fileCount: 'fileCount'
    },
    prepare({ title, subtitle, fileCount }) {
      return {
        title,
        subtitle: `${subtitle} - ${fileCount} file${fileCount === 1 ? '' : 's'}`
      }
    }
  }
})
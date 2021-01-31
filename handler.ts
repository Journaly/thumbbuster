import AWS from 'aws-sdk'
import sharp, { Sharp } from 'sharp'
import { S3Handler } from 'aws-lambda'

const s3 = new AWS.S3()

type TransformDefinition = {
  name: string
  transform: (input: Sharp) => Promise<Buffer>
}

type HandlerDefinition = {
  transforms: TransformDefinition[],
}


const createHandler = (handlerDef: HandlerDefinition) => {
  const handler: S3Handler = async (event, contex) => {
    for (let i=0; i<event.Records.length; i++) {
      const rec = event.Records[i]
      const inputImage = await s3.getObject({
        Bucket: rec.s3.bucket.name,
        Key: rec.s3.object.key,
      }).promise()

      const input = sharp(inputImage.Body)

      await Promise.all(handlerDef.transforms.map(async ({ name, transform }) => {
        const transformed = await transform(input.clone())

        return s3.putObject({
          Bucket: process.env.TRANSFORM_BUCKET!,
          Key: `${rec.s3.object.key}-${name}`,
          Body: transformed,
          ContentType: 'image/jpeg',
          StorageClass: 'INTELLIGENT_TIERING',
        }).promise()

      }))
    }
  }

  return handler
}

export const handlePostImage = createHandler({
  transforms: [
    {
      name: 'large',
      transform: (input) => (input
        .resize(1200, null, { withoutEnlargement: true })
        .jpeg({ quality: 90 })
        .toBuffer())
    },
    {
      name: 'small',
      transform: (input) => (input
        .resize(400, null, { withoutEnlargement: true })
        .jpeg({ quality: 90 })
        .toBuffer())
    },
  ]
})

export const handleAvatarImage = createHandler({
  transforms: [
    {
      name: 'large',
      transform: (input) => (input
        .resize(150, 150, { fit: 'cover' })
        .jpeg({ quality: 90 })
        .toBuffer())
    },
  ]
})

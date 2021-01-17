import AWS from 'aws-sdk'
import sharp from 'sharp'
import { S3Handler } from 'aws-lambda'

const s3 = new AWS.S3()

export const handleUpload: S3Handler = async (event, contex) => {
  for (let i=0; i<event.Records.length; i++) {
    const rec = event.Records[i]
    const inputImage = await s3.getObject({
      Bucket: rec.s3.bucket.name,
      Key: rec.s3.object.key,
    }).promise()

    const input = sharp(inputImage.Body)

    const t = async (size: number, suffix: string) => {
      const transformed = await input.clone()
        .resize(size, null, { withoutEnlargement: true })
        .jpeg({ quality: 90 })
        .toBuffer()

      return s3.putObject({
        Bucket: process.env.TRANSFORM_BUCKET!,
        Key: `${rec.s3.object.key}-${suffix}`,
        Body: transformed,
        ContentType: "image"
      }).promise()
    }

    await Promise.all([
      t(1200, 'large'),
      t(400, 'small'),
    ])
  }
}

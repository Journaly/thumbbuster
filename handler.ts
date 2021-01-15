import AWS from 'aws-sdk'
import sharp from 'sharp'
import { S3Handler } from 'aws-lambda'

const s3 = new AWS.S3()

export const handleUpload: S3Handler = async (event, contex) => {
  for (let i=0; i<event.Records.length; i++) {
    const rec = event.Records[i]
    console.log(rec)
    const inputImage = await s3.getObject({
      Bucket: rec.s3.bucket.name,
      Key: rec.s3.object.key,
    }).promise()

    const resized = await sharp(inputImage.Body).resize(150).toBuffer();

    await s3.putObject({
        Bucket: process.env.TRANSFORM_BUCKET!,
        Key: rec.s3.object.key + '-tiny',
        Body: resized,
        ContentType: "image"
    }).promise(); 
  }

  return { message: `Done!` }
}

import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { MediaService } from './services/media.service';

@Processor('file_queue')
export class BullProcessor {
    constructor(
        private mediaService: MediaService
    ) { }

    @Process('convert')
    async convertVideo(job: Job) {
        console.log(`Starting video conversion for job ${job.id}. Data: ${job.data}`);

        try {
            const { file, resolution } = job.data;

            console.log({ file, resolution })

            const result = await this.mediaService.generateVideo(file, resolution);

            console.log(`Video conversion completed for job ${job.id}`);
            return result;
        } catch (error) {
            console.error(`Failed to convert video for job ${job.id}. Error: ${error.message}`);
            throw error;
        }
    }

}
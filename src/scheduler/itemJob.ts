import { prisma } from 'src/utils';
import { SimpleIntervalJob, AsyncTask } from 'toad-scheduler';

const expireItemsIfExceedWithrawalDeadline = new AsyncTask(
  'Verify expired items',
  async () => {
    const todayDate = new Date();
    await prisma.item.updateMany({
      data: {
        status: 'EXPIRED',
      },
      where: {
        withdrawalDeadline: {
          gt: todayDate,
        },
      },
    });
  },
  (err) => console.error('SCHEDULER ERROR: ', err),
);

export const expireItemsJob = new SimpleIntervalJob(
  { days: 1 },
  expireItemsIfExceedWithrawalDeadline,
);

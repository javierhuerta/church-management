import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateHomeConfigDto } from './home-config.dto';

async function errorFields(payload: Record<string, unknown>): Promise<string[]> {
  const errors = await validate(plainToInstance(UpdateHomeConfigDto, payload));
  return errors.map((e) => e.property);
}

describe('UpdateHomeConfigDto campaign fields', () => {
  it('accepts empty strings to clear URL, album and date fields', async () => {
    expect(
      await errorFields({
        campaignCtaUrl: '',
        campaignSecondaryCtaUrl: '',
        campaignVideoUrl: '',
        campaignAlbumId: '',
        campaignCountdownTarget: '',
        campaignStartsAt: '',
        campaignEndsAt: '',
      }),
    ).toEqual([]);
  });

  it('accepts absolute http(s) URLs', async () => {
    expect(
      await errorFields({
        campaignCtaUrl: 'https://regresiva.adventistascentralosorno.cl',
        campaignVideoUrl: 'https://youtu.be/abcDEF12345',
      }),
    ).toEqual([]);
  });

  it('rejects URLs without protocol, which the website would render as relative links', async () => {
    expect(
      await errorFields({
        campaignCtaUrl: 'regresiva.adventistascentralosorno.cl',
        campaignSecondaryCtaUrl: 'www.example.com/libro.pdf',
        campaignVideoUrl: 'youtu.be/abcDEF12345',
      }),
    ).toEqual(['campaignCtaUrl', 'campaignSecondaryCtaUrl', 'campaignVideoUrl']);
  });

  it('rejects an invalid layout', async () => {
    expect(await errorFields({ campaignLayout: 'banner' })).toEqual(['campaignLayout']);
  });
});

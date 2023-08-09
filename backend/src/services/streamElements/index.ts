// Services for handling streamElements settings
import { Options } from '../helpers';
import { StreamElementsSettings as StreamElementsSettingsSchema } from '../../database/schema';

export class StreamElementsSettingsService {
  static async get() {
    const streamElementsSettings = await StreamElementsSettingsSchema.findOne(
      {}
    );

    if (!streamElementsSettings) {
      return {
        success: false,
        data: null,
        error: null,
        msg: null,
      };
    }

    return {
      success: true,
      data: streamElementsSettings,
      error: null,
      msg: null,
    };
  }

  static async create(options: Options) {
    const { body: streamElementsSettings } = options;

    if (!streamElementsSettings) {
      throw new Error('No StreamElements Settings Provided');
    }

    const newStreamElementsSettings = await StreamElementsSettingsSchema.create(
      streamElementsSettings
    );

    if (!newStreamElementsSettings) {
      return {
        success: false,
        data: null,
        error: null,
        msg: 'Error Creating StreamElements Settings',
      };
    }

    return {
      success: true,
      data: newStreamElementsSettings,
      error: null,
      msg: null,
    };
  }

  static async update(options: Options) {
    const { body: streamElementsSettings } = options;

    if (!streamElementsSettings) {
      throw new Error('No StreamElements Settings Provided');
    }

    const updatedStreamElementsSettings =
      await StreamElementsSettingsSchema.findOneAndUpdate(
        {},
        streamElementsSettings,
        { new: true }
      );

    if (!updatedStreamElementsSettings) {
      return {
        success: false,
        data: null,
        error: null,
        msg: 'Error Updating StreamElements Settings',
      };
    }

    return {
      success: true,
      data: updatedStreamElementsSettings,
      error: null,
      msg: null,
    };
  }
}

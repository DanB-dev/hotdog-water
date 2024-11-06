// Services for handling twitch settings
import { getTwitchSettings, Options } from "../helpers";
import { TwitchSettings as TwitchSettingsSchema } from "../../database/schema";
import { TwitchSettingsInt } from "../../utils/helpers";
export class TwitchSettingsService {
  static async get() {
    const twitchSettings = await TwitchSettingsSchema.findOne({});

    if (!twitchSettings) {
      return {
        success: false,
        data: null,
        error: null,
        msg: null,
      };
    }

    return { success: true, data: twitchSettings, error: null, msg: null };
  }

  static async create(options: Options) {
    const { body: twitchSettings } = options;

    if (!twitchSettings) {
      throw new Error("No Twitch Settings Provided");
    }

    const newTwitchSettings = await TwitchSettingsSchema.create(twitchSettings);

    if (!newTwitchSettings) {
      return {
        success: false,
        data: null,
        error: null,
        msg: "Error Creating Twitch Settings",
      };
    }

    return { success: true, data: newTwitchSettings, error: null, msg: null };
  }

  static async update(options: Options) {
    const { body: twitchSettings } = options;

    if (!twitchSettings) {
      throw new Error("No Twitch Settings Provided");
    }
    const updatedTwitchSettings = await TwitchSettingsSchema.findOneAndUpdate(
      {},
      twitchSettings,
      { new: true }
    );

    if (!updatedTwitchSettings) {
      return {
        success: false,
        data: null,
        error: null,
        msg: "Error Updating Twitch Settings",
      };
    }

    return {
      success: true,
      data: updatedTwitchSettings,
      error: null,
      msg: null,
    };
  }

  static async runAd(options: Options) {
    const adURL = "https://api.twitch.tv/helix/channels/commercial";
    const adDuration = 180;
    // Get Twitch Settings
    const { twitchClientID, twitchAccessToken, twitchBroadcasterID } =
      await getTwitchSettings();

    const adSettings = {
      broadcaster_id: twitchBroadcasterID,
      length: adDuration,
    };

    const response = await fetch(adURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Client-ID": twitchClientID!,
        Authorization: `Bearer ${twitchAccessToken}`,
      },
      body: JSON.stringify(adSettings),
    });

    if (!response.ok) {
      return {
        success: false,
        data: null,
        error: response.statusText,
        msg: "Error Running Ad",
      };
    }

    return { success: true, data: null, error: null, msg: null };
  }

  static async searchCategories(options: Options) {
    const { query } = options;

    const searchURL = `https://api.twitch.tv/helix/search/categories?query=${query}`;

    const { twitchClientID, twitchAccessToken } = await getTwitchSettings();

    const response = await fetch(searchURL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Client-ID": twitchClientID!,
        Authorization: `Bearer ${twitchAccessToken}`,
      },
    });

    if (!response.ok) {
      return {
        success: false,
        data: null,
        error: response.statusText,
        msg: "Error Searching Categories",
      };
    }

    const data = await response.json();

    return { success: true, data, error: null, msg: null };
  }

  static async updateChannel(options: Options) {
    const { gameName, title, isBrandedContent } = options;

    let gameID = null;
    if (gameName) {
      const response = await TwitchSettingsService.searchCategories({
        query: gameName,
      });
      gameID = response.data.data[0].id;
    }

    const { twitchClientID, twitchAccessToken, twitchBroadcasterID } =
      await getTwitchSettings();

    const URL = `https://api.twitch.tv/helix/channels?broadcaster_id=${twitchBroadcasterID}`;

    const channelSettings = {} as any;
    channelSettings.is_branded_content = false;

    if (gameID) {
      channelSettings.game_id = gameID;
    }
    if (title) {
      channelSettings.title = title;
    }
    if (isBrandedContent !== undefined) {
      channelSettings.is_branded_content = isBrandedContent;
    }

    const response = await fetch(URL, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Client-ID": twitchClientID!,
        Authorization: `Bearer ${twitchAccessToken}`,
      },
      body: JSON.stringify(channelSettings),
    });

    if (!response.ok) {
      return {
        success: false,
        data: null,
        error: response.statusText,
        msg: "Error Updating Channel",
      };
    }

    return { success: true, data: null, error: null, msg: null };
  }

  static async getNewAccessToken() {
    const twitchSettings = await TwitchSettingsService.get();
    const { twitchClientID, twitchClientSecret, twitchRefreshToken } =
      twitchSettings.data as Partial<TwitchSettingsInt>;

    const URL = `https://id.twitch.tv/oauth2/token?client_id=${twitchClientID}&client_secret=${twitchClientSecret}&grant_type=refresh_token&refresh_token=${encodeURIComponent(
      twitchRefreshToken!
    )}`;

    const response = await fetch(URL, {
      method: "POST",
    });

    if (!response.ok) {
      return {
        success: false,
        data: null,
        error: response.statusText,
        msg: "Error Getting Access Token",
      };
    }

    const data = await response.json();

    await TwitchSettingsService.update({
      body: {
        twitchAccessToken: data.access_token,
        twitchRefreshToken: data.refresh_token,
        twitchTokenExpires: new Date(Date.now() + data.expires_in * 1000),
      },
    });

    return { success: true, data, error: null, msg: null };
  }

  static async getChannelData(options: Options) {
    const { twitchClientID, twitchAccessToken, twitchBroadcasterID } =
      await getTwitchSettings();

    const URL = `https://api.twitch.tv/helix/channels?broadcaster_id=${twitchBroadcasterID}`;

    const response = await fetch(URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Client-ID": twitchClientID!,
        Authorization: `Bearer ${twitchAccessToken}`,
      },
    });

    if (!response.ok) {
      return {
        success: false,
        data: null,
        error: response.statusText,
        msg: "Error Getting Channel Data",
      };
    }

    const unclean = await response.json();

    //remove the unnecessary nested data and return only the first element
    const data = unclean.data.map((d: any) => {
      return {
        game_name: d.game_name,
        title: d.title,
      };
    })[0];

    return { success: true, data, error: null, msg: null };
  }
}

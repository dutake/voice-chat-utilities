const { getModule, React, constants } = require("powercord/webpack");
const { getVoiceStatesForChannel } = getModule(["getVoiceStatesForChannel"], false);
const { inject, uninject } = require("powercord/injector");
const { patch } = getModule(["V8APIError", "patch"], false);
const Menu = getModule(["MenuGroup", "MenuItem"], false);
const { getChannel } = getModule(["getChannel", "getDMFromUserId"], false);
const { Plugin } = require("powercord/entities");
const { getVoiceChannelId } = getModule(["getVoiceChannelId"], false);
const { clipboard } = require("electron");
const Settings = require("./Settings.jsx");
const { sleep } = require("powercord/util");
  
const getuser = require("powercord/webpack").getModule(["getCurrentUser"],false); // thanks to Oocrop for showing me how to get the user's perms

module.exports = class VoiceChatUtilities extends (Plugin) {
    async startPlugin() {
		powercord.api.settings.registerSettings("VoiceChatUtilities", {
			category: this.entityID,
			label: "Voicechat Utilities",
        	render: Settings,
	  	});
  
		const can = (await getModule(["getChannelPermissions"])).can;
		const channelStore = await getModule(["getChannels"]);
	
		// Giving credit where credit is due,
		// https://github.com/Tharki-God/BetterDiscordPlugins/blob/master/VoiceChatUtilities.plugin.js
		// I referenced this in order to fix the entire plugin as a whole.
		this.lazyPatchContextMenu('useChannelDeleteItem', async ContextMenu => {
			inject('voice-chat-utilities', ContextMenu, 'default', (args, res) => {
				let user = getuser.getCurrentUser(); //the user
				let channel = args[0];
		
				let channelmembers = this.getVoiceChannelMembers(channel.id);
		
				const guildChannels = channelStore.getChannels(channel.guild_id);
				const voiceChannels = guildChannels.VOCAL.map(({ channel }) => channel);

				let children = [];
		
				if (channelmembers.length < 1) return res;
		
				if (this.settings.get("voicechatcopyids", false))
					children.push(
						React.createElement(
							Menu.MenuGroup,
							null,
							React.createElement(Menu.MenuItem, {
								action: async () => {
									clipboard.writeText(channelmembers.join("\n"));
								},
								id: "copy-all-vc-members",
								label: "Copy All User Ids",
							})
						)
					);
		
				if (channelmembers.length == 1 && channelmembers.includes(user.id))
					return res;

				if (
					!can(constants.Permissions.MOVE_MEMBERS, channel) &&
					!can(constants.Permissions.MUTE_MEMBERS, channel) &&
					!can(constants.Permissions.DEAFEN_MEMBERS, channel)
				)
					return res;

				let currentChannel = this.getVoiceChannel();
				let delaybetweenactions =
					this.settings.get("BulkActionsdelay", 0.25) * 1000;
		
				let item = React.createElement(
					Menu.MenuItem,
					{
						id: "mass-vc-tools-group-header",
						label: "Mass voicechat tools",
					},
					can(constants.Permissions.MOVE_MEMBERS, channel) &&
					React.createElement(
						Menu.MenuItem,
						{
							action: async () => {
								for (const member of channelmembers) {
									patch({
										url: constants.Endpoints.GUILD_MEMBER(
											channel.guild_id,
											member
										),
										body: {
											channel_id: null,
										},
									});
				
									if(delaybetweenactions != 0) await sleep(delaybetweenactions);
								}
							},
							id: "disconnect-all-vc",
							label: "Disconnect All",
						},
		
						getVoiceChannelId() == channel.id &&
						currentChannel.members.length > 1 &&
						currentChannel &&
						React.createElement(Menu.MenuItem, {
							action: async () => {
								for (const member of channelmembers) {
									if (member == user.id) continue;

									patch({
										url: constants.Endpoints.GUILD_MEMBER(
											channel.guild_id,
											member
										),
										body: {
											channel_id: null,
										},
									});

									if (delaybetweenactions != 0) await sleep(delaybetweenactions);
								}
							},
							id: "disconnect-all-vc-except-self",
							label: "Disconnect all except self",
						})
					),
		
					can(constants.Permissions.MOVE_MEMBERS, channel) &&
					React.createElement(Menu.MenuItem, {
						id: "move-all-vc",
						label: "Move All",
		
						children: voiceChannels.map((channel) =>
						React.createElement(Menu.MenuItem, {
							action: async () => {
								for (const member of channelmembers) {
									patch({
										url: constants.Endpoints.GUILD_MEMBER(
											channel.guild_id,
											member
										),
										body: {
											channel_id: channel.id,
										},
									});

									if (delaybetweenactions != 0) await sleep(delaybetweenactions);
								}
							},
		
							id: channel.id,
							label: channel.name,
						})
						),
					}),
		
					/// gonna save this code for later since im actually stupid af
		
					can(constants.Permissions.MUTE_MEMBERS, channel) &&
					React.createElement(
						Menu.MenuItem,
						{
							action: async () => {
								for (const member of channelmembers) {
									patch({
										url: constants.Endpoints.GUILD_MEMBER(
											channel.guild_id,
											member
										),
										body: {
											mute: true,
										},
									});

									if (delaybetweenactions != 0) await sleep(delaybetweenactions);
								}
							},
							id: "mute-all-vc",
							label: "Mute All",
						},
		
						getVoiceChannelId() == channel.id &&
						currentChannel.members.length > 1 &&
						currentChannel &&
						React.createElement(Menu.MenuItem, {
							action: async () => {
								for (const member of channelmembers) {
									if (member == user.id) continue;
										patch({
										url: constants.Endpoints.GUILD_MEMBER(
											channel.guild_id,
											member
										),
										body: {
											mute: true,
										},
									});

									if (delaybetweenactions != 0) await sleep(delaybetweenactions);
								}
							},
							id: "mute-all-vc-except-self",
							label: "Mute all except self",
						})
					),
					can(constants.Permissions.MUTE_MEMBERS, channel) &&
					React.createElement(
						Menu.MenuItem,
						{
							action: async () => {
								for (const member of channelmembers) {
									patch({
										url: constants.Endpoints.GUILD_MEMBER(
											channel.guild_id,
											member
										),
										body: {
											mute: false,
										},
									});

									if (delaybetweenactions != 0) await sleep(delaybetweenactions);
								}
							},
							id: "unmute-all-vc",
							label: "Unmute All",
						},
						getVoiceChannelId() == channel.id &&
						currentChannel.members.length > 1 &&
						currentChannel &&
						React.createElement(Menu.MenuItem, {
							action: async () => {
								for (const member of channelmembers) {
									if (member == user.id) continue;
										patch({
										url: constants.Endpoints.GUILD_MEMBER(
											channel.guild_id,
											member
										),
										body: {
											mute: false,
										},
									});

									if (delaybetweenactions != 0) await sleep(delaybetweenactions);
								}
							},
							id: "unmute-all-vc-except-self",
							label: "Unmute all except self",
						})
					),
					can(constants.Permissions.DEAFEN_MEMBERS, channel) &&
					React.createElement(
						Menu.MenuItem,
						{
							action: async () => {
								for (const member of channelmembers) {
									patch({
										url: constants.Endpoints.GUILD_MEMBER(
											channel.guild_id,
											member
										),
										body: {
											deaf: true,
										},
									});
									if(delaybetweenactions != 0) await sleep(delaybetweenactions);
								}
							},
							id: "deafen-all-vc",
							label: "Deafen All",
						},
						getVoiceChannelId() == channel.id &&
						currentChannel.members.length > 1 &&
						currentChannel &&
						React.createElement(Menu.MenuItem, {
							action: async () => {
							for (const member of channelmembers) {
								if (member == user.id) continue;

								patch({
									url: constants.Endpoints.GUILD_MEMBER(
										channel.guild_id,
										member
									),
									body: {
										deaf: true,
									},
								});

								if (delaybetweenactions != 0) await sleep(delaybetweenactions);
							}
							},
							id: "deafen-all-vc-except-self",
							label: "Deafen all except self",
						})
					),
					can(constants.Permissions.DEAFEN_MEMBERS, channel) &&
					React.createElement(
						Menu.MenuItem,
						{
							action: async () => {
								for (const member of channelmembers) {
									patch({
										url: constants.Endpoints.GUILD_MEMBER(
											channel.guild_id,
											member
										),
										body: {
											deaf: false,
										},
									});
									if (delaybetweenactions != 0) await sleep(delaybetweenactions);
								}
							},
							id: "undeafen-all-vc",
							label: "Undeafen All",
						},
						getVoiceChannelId() == channel.id &&
						currentChannel.members.length > 1 &&
						currentChannel &&
						React.createElement(Menu.MenuItem, {
							action: async () => {
								for (const member of channelmembers) {
									if (member == user.id) continue;
										patch({
										url: constants.Endpoints.GUILD_MEMBER(
											channel.guild_id,
											member
										),
										body: {
											deaf: false,
										},
									});

									if (delaybetweenactions != 0) await sleep(delaybetweenactions);
								}
							},
							id: "undeafen-all-vc-except-self",
							label: "Undeafen all except self",
						})
					)
				);
				let element = React.createElement(Menu.MenuGroup, null, item);
		
				children.push(element);
				children.push(res);
		
				return children;
			}
		)});
	}
	pluginWillUnload() {
		uninject("voice-chat-utilities");
		powercord.api.settings.unregisterSettings("VoiceChatUtilities");
	}
	getVoiceUserIds(guild, channel) {
		return Object.values(getVoiceStatesForChannel(channel))
			.map((a) => a.userId);
	}
	getVoiceChannelMembers(id) {
		let channel = getChannel(id);
		return this.getVoiceUserIds(channel.guild_id, channel.id);
	}
	getVoiceChannel() {
		let channel = getChannel(getVoiceChannelId());
		if (!channel) return;
		return {
			channel: channel,
			members: this.getVoiceUserIds(channel.guild_id, channel.id),
		};
	}
	// Samm-Cheese's Lazy Context Menu patch
	async lazyPatchContextMenu(displayName, patch) {
        const filter = m => m.default && m.default.displayName === displayName
        const m = getModule(filter, false)
        if (m) patch(m)
        else {
            const module = getModule([ 'openContextMenuLazy' ], false)
            inject('vcu-context-lazy-menu', module, 'openContextMenuLazy', args => {
                const lazyRender = args[1]
                args[1] = async () => {
                    const render = await lazyRender(args[0])
                    return (config) => {
                        const menu = render(config)
                        if (menu?.type?.displayName === displayName && patch) {
                            uninject('vcu-context-lazy-menu')
                            patch(getModule(filter, false))
                            patch = false
                        }
                        return menu
                    }
                }
                return args
            }, true)
        }
  	}
  };
  

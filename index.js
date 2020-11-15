const {
	getModule,
	getAllModules,
	React,
	constants,
  } = require("powercord/webpack");
  const ChannelContextMenu = getAllModules(
	(m) =>
	  m.default && m.default.displayName == "ChannelListVoiceChannelContextMenu",
	false
  )[0];
  const { getVoiceStates } = getModule(["getVoiceStates"], false);
  const { inject, uninject } = require("powercord/injector");
  const { patch } = getModule(["APIError", "patch"], false);
  const Menu = getModule(["MenuGroup", "MenuItem"], false);
  const { getChannel } = getModule(["getChannel"], false);
  const { Plugin } = require("powercord/entities");
  
  const { getVoiceChannelId } = getModule(['getVoiceChannelId'], false);

  
  const getuser = require("powercord/webpack").getModule(
	["getCurrentUser"],
	false
  ); // thanks to Oocrop for showing me how to get the user's perms
  module.exports = class disconnectallvoicechat extends Plugin {
	async startPlugin() {
	  const can = (await getModule(["can", "canEveryone"])).can;
	  inject("voice-chat-utilities", ChannelContextMenu, "default", (args, res) => {
		  
		let user = getuser.getCurrentUser(); //the user
		let channel = args[0].channel;
		let channelmembers = this.getVoiceChannelMembers(channel.id);
		if (channelmembers.length < 1) return res;
		if(channelmembers.length == 1 && channelmembers.includes(user.id)) return res;
		if (!can(constants.Permissions.MOVE_MEMBERS, user, channel) && !can(constants.Permissions.MUTE_MEMBERS, user, channel) && !can(constants.Permissions.DEAFEN_MEMBERS, user, channel)) return res;
           let currentChannel = this.getVoiceChannel();
		let item = React.createElement(
		  Menu.MenuItem,
		  {
			//Found out how to add stuff to this kinda menu from https://github.com/Twizzer/move-all-vc
			id: "mass-vc-tools-group-header",
			label: "Mass voicechat tools",
		  },
		  can(constants.Permissions.MOVE_MEMBERS, user, channel) && React.createElement(Menu.MenuItem, {
			//Found out how to add stuff to this kinda menu from https://github.com/Twizzer/move-all-vc
			action: async () => {
			  for (const member of channelmembers) {
				patch({
				  url: constants.Endpoints.GUILD_MEMBER(channel.guild_id, member), //Found out how to move members from https://github.com/Twizzer/move-all-vc
				  body: {
					channel_id: null,
				  },
				});
			  }
			},
			id: "disconnect-all-vc",
			label: "Disconnect All",
		  }, 
		  
		  getVoiceChannelId() == channel.id &&	currentChannel.members.length > 1 &&  React.createElement(Menu.MenuItem, {
			//Found out how to add stuff to this kinda menu from https://github.com/Twizzer/move-all-vc
			action: async () => {
			  for (const member of channelmembers) {
				if (member == user.id) continue;
				patch({
				  url: constants.Endpoints.GUILD_MEMBER(channel.guild_id, member), //Found out how to move members from https://github.com/Twizzer/move-all-vc
				  body: {
					channel_id: null,
				  },
				});
			  }
			},
			id: "disconnect-all-vc-except-self",
			label: "Disconnect all except self",
		  })
		  
		 
		 
		 
		  ),

		  //if (member == user.id) continue;
		  can(constants.Permissions.MUTE_MEMBERS, user, channel) &&  React.createElement(Menu.MenuItem, {
			action: async () => {
			  for (const member of channelmembers) {
				patch({
				  url: constants.Endpoints.GUILD_MEMBER(channel.guild_id, member),
				  body: {
					mute: true,
				  },
				});
			  }
			},
			id: "mute-all-vc",
			label: "Mute All",
		  },

		  getVoiceChannelId() == channel.id &&	currentChannel.members.length > 1 &&	  React.createElement(Menu.MenuItem, {
			action: async () => {
			  for (const member of channelmembers) {
				if (member == user.id) continue;
				patch({
				  url: constants.Endpoints.GUILD_MEMBER(channel.guild_id, member),
				  body: {
					mute: true,
				  },
				});
			  }
			},
			id: "mute-all-vc-except-self",
			label: "Mute all except self",
		  })),
		  can(constants.Permissions.MUTE_MEMBERS, user, channel) && React.createElement(Menu.MenuItem, {
			action: async () => {
			  for (const member of channelmembers) {
				patch({
				  url: constants.Endpoints.GUILD_MEMBER(channel.guild_id, member),
				  body: {
					mute: false,
				  },
				});
			  }
			},
			id: "unmute-all-vc",
			label: "Unmute All",
		  },		
		  getVoiceChannelId() == channel.id &&  currentChannel.members.length > 1 && React.createElement(Menu.MenuItem, {
			action: async () => {
			  for (const member of channelmembers) {
				if (member == user.id) continue;
				patch({
				  url: constants.Endpoints.GUILD_MEMBER(channel.guild_id, member),
				  body: {
					mute: false,
				  },
				});
			  }
			},
			id: "unmute-all-vc-except-self",
			label: "Unmute all except self",
		  })
		  
		 
		 
		 
		 
		 
		  ),
		  can(constants.Permissions.DEAFEN_MEMBERS, user, channel) && React.createElement(Menu.MenuItem, {
			action: async () => {
			  for (const member of channelmembers) {
				patch({
				  url: constants.Endpoints.GUILD_MEMBER(channel.guild_id, member),
				  body: {
					deaf: true,
				  },
				});
			  }
			},
			id: "deafen-all-vc",
			label: "Deafen All",
		  },
		  getVoiceChannelId() == channel.id &&	currentChannel.members.length > 1 &&	  React.createElement(Menu.MenuItem, {
			action: async () => {
			  for (const member of channelmembers) {
				if (member == user.id) continue;
				patch({
				  url: constants.Endpoints.GUILD_MEMBER(channel.guild_id, member),
				  body: {
					deaf: true,
				  },
				});
			  }
			},
			id: "deafen-all-vc-except-self",
			label: "Deafen all except self",
		  })		  
		 
		 
		  ),
		  can(constants.Permissions.DEAFEN_MEMBERS, user, channel) && React.createElement(Menu.MenuItem, {
			action: async () => {
			  for (const member of channelmembers) {
				  
				patch({
				  url: constants.Endpoints.GUILD_MEMBER(channel.guild_id, member),
				  body: {
					deaf: false,
				  },
				});
			  }
			},
			id: "undeafen-all-vc",
			label: "Undeafen All",
		  },
		  getVoiceChannelId() == channel.id &&	currentChannel.members.length > 1 &&  React.createElement(Menu.MenuItem, {
			action: async () => {
			  for (const member of channelmembers) {
				if (member == user.id) continue;	  
				patch({
				  url: constants.Endpoints.GUILD_MEMBER(channel.guild_id, member),
				  body: {
					deaf: false,
				  },
				});
			  }
			},
			id: "undeafen-all-vc-except-self",
			label: "Undeafen all except self",
		  }) 
		 
		  )
		);
		let element = React.createElement(Menu.MenuGroup, null, item);
		res.props.children.push(element);
		return res;
	  });
	  ChannelContextMenu.default.displayName =
		"ChannelListVoiceChannelContextMenu";
	}
	pluginWillUnload() {
	  uninject("voice-chat-utilities");
	}
	getVoiceUserIds(guild, channel) {
	  return Object.values(getVoiceStates(guild))
		.filter((c) => c.channelId == channel)
		.map((a) => a.userId);
	}
	getVoiceChannelMembers(id) {
	  let channel = getChannel(id);
	  return this.getVoiceUserIds(channel.guild_id, channel.id);
	}
	getVoiceChannel() {
		let channel = getChannel(getVoiceChannelId());
		return { channel: channel, members: this.getVoiceUserIds(channel.guild_id, channel.id) };
	 }
  };
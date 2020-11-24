const { React } = require('powercord/webpack');
const { TextInput, SwitchItem, SliderInput } = require('powercord/components/settings');

module.exports = ({ getSetting, updateSetting, toggleSetting }) => (
  <div>    

    <SliderInput
                    stickToMarkers
                    minValue={ 0}
                    maxValue={ 1 }
                    initialValue={ getSetting("BulkActionsdelay", 0.25) }
                    markers={[0, 0.1, 0.25, 0.5, 1]}

                    defaultValue={ getSetting("BulkActionsdelay",0.25) }
                    onValueChange={ v => updateSetting("BulkActionsdelay", v) }
                    note="making it 0 makes all of the actions happen simultaneously (its cool af)"
                >
Bulk Actions delay (seconds)

</SliderInput>



<SwitchItem
      note='Whether or not to show the button to copy the ids of all of the members of a voicechannel'
      value={getSetting('voicechatcopyids', false)}
      onChange={() => toggleSetting('voicechatcopyids')}
    >
      Show all user ids
          </SwitchItem>






  </div>
);

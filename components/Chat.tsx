import React from 'react'
import {
  Text,
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert
} from 'react-native'
import { connect } from 'react-redux'
import { getChat } from '../src/actions/chats'
import { blockUser } from '../src/actions/users'

interface Props {
  chat: Chat
  getChat: Function
  socket: Socket
  currentUserEmail: string
  blockUser: Function
}

interface Socket {
  send: Function
}

interface Chat {
  chat_id: number
  participants: Array<Participant>
}

interface Participant {
  email: string
  first_name: string
  profile_photo: string
}

class Chat extends React.Component<Props> {
  confirmBlock = participant => {
    Alert.alert(
      'Are you sure?',
      `If you block ${participant.first_name}, you won't be able to message or hangout with each other.`,
      [
        {
          text: 'Block User',
          onPress: () =>
            this.props.blockUser(
              this.props.currentUserEmail,
              participant.email,
              this.props.chat.chat_id
            )
        },
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel'
        }
      ],
      { cancelable: true }
    )
  }
  render() {
    return (
      <TouchableOpacity
        style={styles.chat}
        onPress={() => this.props.getChat(this.props.chat.chat_id)}
      >
        {this.props.chat.participants.map(participant => {
          return (
            <Image
              key={participant.email}
              source={{ uri: participant.profile_photo }}
              style={styles.chat__image}
            ></Image>
          )
        })}
        <View style={styles.chat__textcontainer}>
          {this.props.chat.participants.map(participant => {
            return (
              <View key={participant.email}>
                <Text style={styles.chat__text}>{participant.first_name}</Text>
                <Text
                  style={styles.chat__text}
                  onPress={() => this.confirmBlock(participant)}
                >
                  Block User
                </Text>
              </View>
            )
          })}
        </View>
      </TouchableOpacity>
    )
  }
}

const styles = StyleSheet.create({
  chat: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginTop: 30,
    backgroundColor: 'black',
    borderRadius: 400
  },
  chat__image: {
    borderRadius: 50,
    height: 90,
    width: 90
  },
  chat__textcontainer: {
    flexDirection: 'column',
    alignItems: 'center',
    marginLeft: 50,
    right: 40
  },
  chat__text: {
    fontSize: 18,
    color: 'white'
  },
  chat__badges: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    right: 15
  }
})

const mapStateToProps = state => {
  return {
    socket: state.socket,
    currentUserEmail: state.user.email
  }
}

const mapDispatchToProps = dispatch => {
  return {
    getChat: chatId => dispatch(getChat(chatId)),
    blockUser: (currentUserEmail, blockedUserEmail, chatId) =>
      dispatch(blockUser(currentUserEmail, blockedUserEmail, chatId))
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Chat)

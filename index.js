import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { View, Image, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import ChangeAuthor from 'components/modals/ChangeAuthor';
import * as ActionTypes from 'services/modules/home/actions';
import _ from 'lodash';
import {
  setLastReadedStory,
  removeLastReadedStory,
  removeSelectedUser,
} from 'services/apis/storageApis';
import { dayPeriodImgs } from './constants';
import { sendPushNotificationMorning, sendPushNotificationEvening } from 'services/utils';
import { styles } from './styles';
export const DayStoryScreen = ({ navigation }) => {
  const {
    currentStoryInfo,
    currentStory,
    currentName,
    currentDayNumber,
    diaries,
    nextDayPeriod,
    missedStoryInfo,
    nextDayNumber,
    currentDayPeriod,
    readedStoryDayNumber,
    readedStoryDayPeriod,
    readedStory,
  } = useSelector(({ home }) => home);
  const dispatch = useDispatch();
  const [showChangeAuthorModal, setShowChangeAuthorModal] = useState(false);
  const userIndex = diaries.findIndex((d) => d.FirstName === currentName);
  const currentDiaries = _.omitBy(diaries[userIndex], (v) => _.isEmpty(v));
  const keysArray = _.filter(Object.keys(currentDiaries), (name) => name.includes('DAY'));
  const isCurrentStoryLast = keysArray[keysArray.length - 1] === currentStoryInfo;
  const changeAuthorDay = currentDayNumber === '5' && nextDayNumber === '6';
  useEffect(() => {
    if (missedStoryInfo.length > 0) {
      if (missedStoryInfo[2] === 'AM') sendPushNotificationMorning();
      else sendPushNotificationEvening();
    }
  }, []);
  const goHome = () => {
    navigation.navigate('home-screen');
  };
  const callNotifications = () => {
    if (nextDayPeriod.length > 0 && nextDayPeriod === 'AM') {
      sendPushNotificationMorning();
    } else if (nextDayPeriod.length > 0 && nextDayPeriod === 'PM') {
      sendPushNotificationEvening();
    }
    if (isCurrentStoryLast) {
      removeLastReadedStory();
      removeSelectedUser();
      dispatch(ActionTypes.changeUser());
    } else setLastReadedStory(currentStoryInfo);
    goHome();
  };
  const doneReadingPress = () => {
    if (changeAuthorDay) {
      setShowChangeAuthorModal(true);
    } else callNotifications();
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={goHome}>
          <Text style={styles.backButtonText}>Home</Text>
        </TouchableOpacity>
        <ScrollView
          contentContainerStyle={styles.mainContainer}
          showsVerticalScrollIndicator={false}
        >
          {!!currentDayPeriod && (
            <Image source={dayPeriodImgs[currentDayPeriod]} style={styles.periodImg} />
          )}
          {!!readedStoryDayPeriod && (
            <Image source={dayPeriodImgs[readedStoryDayPeriod]} style={styles.periodImg} />
          )}
          {currentDayNumber && (
            <View style={styles.dayTitle}>
              <Text style={styles.dayTitleText}>DAY {currentDayNumber}</Text>
            </View>
          )}
          {!!readedStoryDayNumber && (
            <View style={styles.dayTitle}>
              <Text style={styles.dayTitleText}>DAY {readedStoryDayNumber}</Text>
            </View>
          )}
          {currentStory.length > 0 && (
            <View style={styles.storyContainer}>
              <Text style={styles.storyContainerText}>{currentStory}</Text>
              <TouchableOpacity style={styles.doneReadingButton} onPress={doneReadingPress}>
                <Text style={styles.doneReadingButtonText}>DONE READING</Text>
              </TouchableOpacity>
            </View>
          )}
          {!!readedStory && (
            <View style={styles.storyContainer}>
              <Text style={styles.storyContainerText}>{readedStory}</Text>
            </View>
          )}
        </ScrollView>
        {isCurrentStoryLast && (
          <Text style={styles.buttomTitle}>
            {currentName}'s' life isn't the only one that was robbed so unjustly. Read more >>
          </Text>
        )}
        {missedStoryInfo.length > 0 && !isCurrentStoryLast && (
          <Text style={styles.buttomTitle}>
            Check back on {currentName}'s day in the{' '}
            {missedStoryInfo[2] === 'AM' ? 'morning' : 'evening'}
          </Text>
        )}
        <ChangeAuthor
          currentName={currentName}
          showModal={showChangeAuthorModal}
          setShowModal={(show) => setShowChangeAuthorModal(show)}
          onCancelPress={() => {
            callNotifications();
          }}
          onOkPress={() => {
            removeLastReadedStory();
            removeSelectedUser();
            dispatch(ActionTypes.changeUser());
            goHome();
          }}
        />
      </View>
    </SafeAreaView>
  );
};

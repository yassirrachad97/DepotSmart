import React , {useState} from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
import axios from "axios";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import { Warehouseman } from "../components/data/warehouseman";


type RootStackParamList = {
    Login: undefined;
    Home: undefined
};

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;
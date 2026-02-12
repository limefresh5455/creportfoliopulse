import { configureStore } from "@reduxjs/toolkit";
import loginReducer from "../Slice/LoginSlice";
import BuildingReducer from "../Slice/BuildingSlice";
import OfficeReducer from "../Slice/LeaseSlice";
import DocReducer from "../Slice/DocSlice";
import ProfileReducer from "../../User/Slice/ProfileSlice";
import ForumReducer from "../Slice/forumSlice";
import notesReducer from "../../User/Slice/notesSlice";
import subleaseReducer from "../Slice/subleaseTrackerSlice";
import RenewalReducer from "../Slice/RenewalTrackerSlice";
import chatSystemReducer from "../../User/Slice/chatSystemSlice";
import workLetterdocumentReducer from "../../User/Slice/workLetterDocumentSlice";
import timelineReducer from "../../User/Slice/timeLineSlice";
import workLetterChatReducer from "../../User/Slice/workLetterChatSlice";
import lineItemReducer from "../../User/Slice/lineItemSlice";

const store = configureStore({
  reducer: {
    loginSlice: loginReducer,
    BuildingSlice: BuildingReducer,
    LeaseSlice: OfficeReducer,
    DocSlice: DocReducer,
    ProfileSlice: ProfileReducer,
    ForumSlice: ForumReducer,
    notesSlice: notesReducer,
    subleaseSlice: subleaseReducer,
    RenewalSlice: RenewalReducer,
    chatSystemSlice: chatSystemReducer,
    workLetterdocumentSlice: workLetterdocumentReducer,
    timelineSlice: timelineReducer,
    workLetterChatSlice: workLetterChatReducer,
    lineItemSlice: lineItemReducer,
  },
});

export default store;

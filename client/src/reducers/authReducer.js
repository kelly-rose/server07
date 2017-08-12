import {FETCH_USER} from "../actions/types";

export default function(state = null, action) {
    console.log(action);
    switch (action.type){
        case FETCH_USER:
            return action.payload || false;     //section 7 - 80
        default:
            return state;
    }
}
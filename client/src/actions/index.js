import axios from 'axios';

import {FETCH_USER} from "./types";

// export const fetchUser = () =>{
//     return function(dispatch) {
//         axios.get('/api/current_user')
//             .then(res=>dispatch({type:FETCH_USER, payload:res}));
//     };
// };


// ES6
export const fetchUser = () => async dispatch => {
    const res = await axios.get('/api/current_user');
    dispatch({type: FETCH_USER, payload: res.data});
};

export const handleToken = (token)=> async dispatch => {
    const res = await axios.post('/api/stripe',token);
    dispatch({type: FETCH_USER, payload: res.data});
};

export const submitSurvey = (values,history) => async dispatch => {
    const res = await axios.post('/api/surveys', values);

    history.push('/surveys');   //section 11 - 167
    dispatch({ type: FETCH_USER, payload: res.data });
};


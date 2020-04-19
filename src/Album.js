import React from "react";
import {Redirect} from 'react-router-dom';
import SpotifyHandler from "./spotifyHandler";
import SvgComponent from "./SvgComponent";

class Album extends React.Component {

    render() {
        const id = this.props.match.params.id;
        const pageId = id.match(/[0-9A-Za-z]{22}/)
        const regex = /&qid=([q|Q][0-9][0-9]+)/;
        let qid = regex.exec(id)
        let regexqid
        if (Array.isArray(qid) && qid.length) {
            regexqid = qid[1]
        }

        if (!pageId) {
            return <Redirect to={{pathname: "/404"}}/>;
        }
        return (
            <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', zIndex: '3', position: 'relative'}} className="size">
                    <SvgComponent />
                </div>
                <SpotifyHandler page={pageId} qid={regexqid}/>
            </div>
        )
    };
}

export default Album;
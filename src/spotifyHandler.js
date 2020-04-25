import React from "react";
import MyLoader from "./Loader";

class SpotifyHandler extends React.Component {
    constructor(props) {
      super(props);
      this.myRef = React.createRef();
      this.state = {
          Loading: true,
          album: { Loading: true, Label: '', albumArt: '', P31: '', P2207: '', P264: '', P136: [], P2635: 0, P577: '', P175: [], Upc: '', Copyrights: [] },
          wdAlbum: {Loading: true, result: {entities: {wdId: { claims: {P175: [{mainsnak: {datavalue: {value: {id: ''}}}}], P658: [] } } } } },
          wdLabel: {Loading: true, result: {entities: { wdId: {labels: {en: { value: '' } } } } } }, //artist label!!!
          wdTrack: {Loading: true, result: {entities: {} } },
          wdQuery: {Loading: true, result: '' },
          MB: {Loading: true, releaseGroups: '', tracks: [] }
      };
    }

    async componentDidMount() {
        await this.getAlbum2();
        await this.getWDAlbum();
        await this.getWDInfo();
        await this.getWDQuery();
        await this.MusicBrainz();
    }

    async getAlbum2() {
        const response = await fetch('https://cors-anywhere.herokuapp.com/https://tatsumo.pythonanywhere.com/api/album/'+this.props.page, { headers: { 'content-Type': "text/javascript" } });
        const data = await response.json();
        this.setState({
            ...this.state,
            album: {
                Loading: false,
                Label: data.name,
                albumArt: data.image.l,
                P31: data.type,
                P2205: data.id,
                P264: data.label,
                P136: data.json.genres,
                P2635: data.json.total_tracks,
                P577: data.json.release_date,
                P175: data.json.artists,
                Upc: data.json.external_ids.upc,
                Copyrights: data.json.copyrights,
                Tracks: data.json.tracks.items,
                Tracks2: data.tracks
            }
        });
    }

    async getWDQuery() {
        if (this.state.wdLabel.Loading === false && this.props.qid) {
            const endpointUrl = 'https://query.wikidata.org/sparql';
            let artists = Object.values(this.state.wdLabel.result.entities)
            artists.map(async (item, index) => {
                const sparqlQuery = `SELECT ?item ?item_label WHERE {
                  ?item wdt:P175 wd:%ARTIST%.
                  ?item rdfs:label ?item_label filter (lang(?item_label) = "en").
                  minus{ ?item wdt:P31/wdt:P279* wd:Q273057.}
                  minus{ ?item wdt:P31/wdt:P279* wd:Q482994.}
                  minus{ ?item wdt:P31/wdt:P279* wd:Q169930.}
                  minus{ ?item wdt:P31/wdt:P279* wd:Q20737336.}
                  minus{ ?item wdt:P31/wdt:P279* wd:Q11424.}
                }
                LIMIT 500`;
                let finQuery = sparqlQuery.replace(/%ARTIST%/,item.id);
                const fullUrl = endpointUrl + '?query=' + encodeURIComponent( finQuery );
                const requestOptions = {
                headers: { 'Accept': 'application/sparql-results+json' }
                };
                const response = await fetch(fullUrl, requestOptions);
                const result = await response.json();
                this.setState({
                        Loading: false,
                        album: {
                            ...this.state.album},
                        wdAlbum: {
                            ...this.state.wdAlbum},
                        wdLabel: {
                            ...this.state.wdLabel},
                        wdTrack: {
                            ...this.state.wdTrack},
                        wdQuery: {
                            Loading: false,
                            result}
                          });
                })
        } else {
            this.setState({
                Loading: false,
                album: {
                    ...this.state.album},
                wdAlbum: {
                    ...this.state.wdAlbum},
                wdLabel: {
                    ...this.state.wdLabel},
                wdTrack: {
                    ...this.state.wdTrack},
                wdQuery: {
                    Loading: false,
                    ...this.state.wdQuery}
                  });
        }
    }

    async getWDInfo() {
        if (this.props.qid && this.state.wdAlbum.Loading === false) {
            if (Array.isArray(this.state.wdAlbum.result.entities[this.props.qid].claims.P175)) {
                let artists = this.state.wdAlbum.result.entities[this.props.qid].claims.P175.map(function (item, index) {
                            return (index ? '|' : '') + item.mainsnak.datavalue.value.id;
                });
                artists = artists.join('');
                const WDAPI2 = `https://cors-anywhere.herokuapp.com/https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&props=labels&languages=en&ids=${artists}`;
                const response = await fetch(WDAPI2);
                const result = await response.json(); //husk endre Loading!!
                this.setState({
                    Loading: true,
                    album: {
                        ...this.state.album
                    },
                    wdAlbum: {
                        ...this.state.wdAlbum
                    },
                    wdLabel: {
                        Loading: false,
                        result}
                })
                } else {
                this.setState({
                    Loading: true,
                    album: {
                        ...this.state.album
                    },
                    wdAlbum: {
                        ...this.state.wdAlbum
                    },
                    wdLabel: {
                        Loading: false,
                        ...this.state.wdAlbum}
                })
            }
            if (Array.isArray(this.state.wdAlbum.result.entities[this.props.qid].claims.P658)) {
                let tracks = this.state.wdAlbum.result.entities[this.props.qid].claims.P658.map(function (item, index) {
                    return (index ? '|' : '') + item.mainsnak.datavalue.value.id;
                })
                tracks = tracks.join('');
                const WDAPI3 = `https://cors-anywhere.herokuapp.com/https://www.wikidata.org/w/api.php?action=wbgetentities&props=aliases|labels|claims&languages=en&redirects=no&format=json&ids=${tracks}`;
                const response = await fetch(WDAPI3);
                const result = await response.json();
                  this.setState( {
                      Loading: true,
                      album: {
                          ...this.state.album},
                      wdAlbum: {
                          ...this.state.wdAlbum},
                      wdLabel: {
                          ...this.state.wdLabel},
                      wdTrack: {
                          Loading: false,
                          result}
                  });
            } else {
                this.setState( {
                      Loading: true,
                      album: {
                          ...this.state.album},
                      wdAlbum: {
                          ...this.state.wdAlbum},
                      wdLabel: {
                          ...this.state.wdLabel},
                      wdTrack: {
                          Loading: false,
                          result: {entities: {} }}
                  });
            }
        } else console.log("No WD item found!")
    }

    async getWDAlbum() {
        if (this.props.qid) {
            const WDAPI = `https://cors-anywhere.herokuapp.com/https://www.wikidata.org/w/api.php?action=wbgetentities&props=aliases|labels|claims&languages=en&redirects=no&format=json&ids=${this.props.qid}`;
            const response = await fetch(WDAPI);
            const result = await response.json();
            this.setState({
                            Loading: true,
                            album: {
                                ...this.state.album
                            },
                            wdAlbum: {
                                Loading: false,
                                result}
                        });
        }
    }

    async getSelectedAlbum(album) {
        const WDAPI3 = `https://cors-anywhere.herokuapp.com/https://www.wikidata.org/w/api.php?action=wbgetentities&props=aliases|labels|claims&languages=en&redirects=no&format=json&ids=${album}`;
        const response = await fetch(WDAPI3);
        return await response.json();
    }

    regexName2 (sendval) {
        let name = sendval.replace(/\s-\s(?=[^-]*$).*/g,'');
        name = name.replace(/ *\([f|F]eat[^)]*\) */g,'');
        name = name.replace(/ *\([w|W]ith[^)]*\) */g,'');
        name = name.replace(/ *\([m|M]ed[^)]*\) */g,'');
        name = name.replace(/ *\([i|I]nterlude[^)]*\) */g,'');
        if (name === '') name = sendval;
        return name
    }

    QSitem(result, querytrack) {
        if (Array.isArray(this.state.wdAlbum.result.entities[this.props.qid].claims?.P175)) {
            let ind = result.nr - 1;
            let fullDate =  "+" + this.state.album.P577 + "T00:00:00Z/11";
            let year,
                month,
                day;
            let P31_1 = "Q7302866";//audio track & song
            let P437 = "Q15982450";
            let spotTrack = this.state.album.Tracks[ind].id;
            let isrc = this.state.album.Tracks2[ind].isrc;
            if (Array.isArray(this.state.wdAlbum.result.entities[this.props.qid].claims.P577)){
                let tempDate = this.state.wdAlbum.result.entities[this.props.qid].claims.P577[0].mainsnak.datavalue.value.time;
                fullDate = tempDate + "/" + this.state.wdAlbum.result.entities[this.props.qid].claims.P577[0].mainsnak.datavalue.value.precision;
                tempDate = tempDate.replace(/T00.*/,'');
                [year, month, day] = tempDate.split('-');
            } else [year, month, day] = this.state.album.P577.split('-')
            if (typeof month == 'undefined') fullDate = "+" + this.state.album.P577 + "T00:00:00Z/9";
            let trackBody;

            let artistSpot = this.state.album.P175.map((item, index) => {
                return (index ? ', ' : '') + item.name
            })
            artistSpot = artistSpot.filter((obj) => { return ![null, undefined].includes(obj) })
            artistSpot = artistSpot.join('');

            let artistWD= this.state.wdAlbum.result.entities[this.props.qid].claims.P175.map((item, index) => {
                return "||LAST|P175|" + item.mainsnak.datavalue.value.id;
            });
            artistWD = artistWD.filter((obj) => { return ![null, undefined].includes(obj) })
            artistWD = artistWD.join('');
            //let RLabelWD = '';
            //if (Array.isArray(this.state.wdAlbum.result.entities[this.props.qid].claims.P264)) {
            //    RLabelWD = this.state.wdAlbum.result.entities[this.props.qid].claims.P264.map((item, index) => {
            //        return "||LAST|P264|" + item.mainsnak.datavalue.value.id;
            //    });
            //    RLabelWD = RLabelWD.filter((obj) => { return ![null, undefined].includes(obj) })
            //    RLabelWD = RLabelWD.join('');
            //}
            let name = this.state.album.Tracks[ind].name;
            if (!this.state.album.Tracks[ind].name.match(/\s-\s(?=[^-]*$).*[R|r]emix/g)) name = this.state.album.Tracks[ind].name.replace(/\s-\s(?=[^-]*$).*/g,'');
            name = name.replace(/ *\([f|F]eat[^)]*\) */g,'');
            name = name.replace(/ *\([w|W]ith[^)]*\) */g,'');
            name = name.replace(/ *\([m|M]ed[^)]*\) */g,'');
            name = name.replace(/ *\([i|I]nterlude[^)]*\) */g,'');
            if (name === '') name = this.state.album.Tracks[ind].name;
            if (name === name.toUpperCase()) {
                name = name.toLowerCase();
                name = name.replace(/(^\w{1})|(\s{1}\w{1})/g, match => match.toUpperCase());
            }
            let mbGroup;
            if (result.MBindex !== -1 && this.state.MB.tracks[result.MBindex].title !== 'ⓧ') {
                if (Array.isArray(this.state.MB.tracks[result.MBindex].isrcs) && this.state.MB.tracks[result.MBindex].isrcs[0] === isrc) mbGroup = `P4404|"${this.state.MB.tracks[result.MBindex].id}"|P1810|"${this.state.MB.tracks[result.MBindex].title}"|P4390|Q39893449`
                else mbGroup = `P4404|"${this.state.MB.tracks[result.MBindex].id}"|P1810|"${this.state.MB.tracks[result.MBindex].title}"`
            }

            let creativework = '';
            let creativework2_69 = '';
            let creativework2_39 = '';
            if (this.state.wdAlbum.result.entities[this.props.qid].claims.P7937) {
                let creative = this.state.wdAlbum.result.entities[this.props.qid].claims.P7937;
                for (let b = 0; b < creative.length; b++){
                    if (creative[b].mainsnak.datavalue.value.id === 'Q208569'){
                        creativework += `||LAST|P1552|Q15975575`;
                        creativework2_69 += `||${result.wdId}|P1552|Q15975575`;
                    }
                    else if (creative[b].mainsnak.datavalue.value.id === 'Q209939') {
                        creativework += `||LAST|P1552|Q56123235`;
                        creativework2_39 += `||${result.wdId}|P1552|Q56123235`;
                    }
                }
            }

            if (result.wdId === "" && result.queryMatch === false) {
                return `||CREATE||LAST|Len|"${name}"||LAST|Den|"${parseInt(year)} audio track by ${artistSpot}"||LAST|P31|${P31_1}||LAST|P1433|${this.props.qid}|P1545|"${result.nr}"|P577|${fullDate}${artistWD}||LAST|P2047|${Math.floor(this.state.album.Tracks[ind].duration_ms / 1000)}U11574|P518|${P437}${creativework}||LAST|${mbGroup}||LAST|P1476|mul:"${name}"||LAST|P1243|"${isrc}"|P4390|Q39893449||LAST|P2207|"${spotTrack}"|P4390|Q39893449|P1810|"${this.state.album.Tracks[ind].name}"||LAST|P437|${P437}||${this.props.qid}|P658|LAST|P1545|"${result.nr}"`;
            }

            let type = result.queryMatch ? querytrack.entities[result.wdId]?.claims : this.state.wdTrack.result.entities[result.wdId]?.claims;

            if (!Array.isArray(type.P31)) {
                trackBody += `||${result.wdId}|P31|${P31_1}`;
            } else {
                let path = result.queryMatch ? querytrack.entities[result.wdId]?.claims?.P31 : this.state.wdTrack.result.entities[result.wdId]?.claims?.P31;
                let found = false;
                for (let b = 0; b < path.length; b++){
                    if (path[b].mainsnak.datavalue.value.id === P31_1){
                        found = true;
                    }
                }
                if (!found) trackBody += `||${result.wdId}|P31|${P31_1}`;
            }

            if (!Array.isArray(type.P1243)) {
                trackBody += `||${result.wdId}|P1243|"${isrc}"`;
            }

            if (!Array.isArray(type.P1476)) {
                trackBody += `||${result.wdId}|P1476|mul:"${name}"`;
            }

            if (!Array.isArray(type.P2047)) {
                trackBody += `||${result.wdId}|P2047|${Math.floor(this.state.album.Tracks[ind].duration_ms / 1000)}U11574|P518|${P437}`;
            }

            if (!Array.isArray(type.P2207)) {
                trackBody += `||${result.wdId}|P2207|"${spotTrack}"|P1810|"${this.state.album.Tracks[ind].name}"`;
            } else {
                let found3 = false;
                for (let y = 0; y < type.P2207.length; y++){
                    if (type.P2207[y].mainsnak.datavalue.value === spotTrack){
                        found3 = true;
                        if (!Array.isArray(type.P2207[y].qualifiers?.P1810)){
                            trackBody += `||${result.wdId}|P2207|"${spotTrack}"|P1810|"${this.state.album.Tracks[ind].name}"`;
                            break;
                        }

                    }
                }
                if (!found3) trackBody += `||${result.wdId}|P2207|"${spotTrack}"|P1810|"${this.state.album.Tracks[ind].name}"`;
            }

            if (!Array.isArray(type.P437)) {
                trackBody += `||${result.wdId}|P437|${P437}`;
            } else {
                let found4;
                for (let n = 0; n < type.P437.length; n++) {
                    if (type.P437[n].mainsnak.datavalue.value.id === P437){
                        found4 = true;
                        break;
                    }
                }
                if (!found4) trackBody += `||${result.wdId}|P437|${P437}`;
            }

            if (!Array.isArray(type.P1433)) {
                if (fullDate) trackBody += `||${result.wdId}|P1433|${this.props.qid}|P1545|"${result.nr}"|P577|${fullDate}`;
                else trackBody += `||${result.wdId}|P1433|${this.props.qid}|P1545|"${result.nr}"`;
            } else {
                let found5;
                for (let q = 0; q < type.P1433.length; q++){
                    if (type.P1433[q].mainsnak.datavalue.value.id === this.props.qid){
                        found5 = true;
                        if (!Array.isArray(type.P1433[q].qualifiers?.P1545)){
                            trackBody += `||${result.wdId}|P1433|${this.props.qid}|P1545|"${result.nr}"`;
                        }
                        if (!Array.isArray(type.P1433[q].qualifiers?.P577)) {
                            trackBody += `||${result.wdId}|P1433|${this.props.qid}|P577|${fullDate}`;
                        }

                    }
                }
                if (!found5) trackBody += `||${result.wdId}|P1433|${this.props.qid}|P1545|"${result.nr}"|P577|${fullDate}`;
            }

            //if (!Array.isArray(type.P264) && RLabelWD){
            //    RLabelWD = RLabelWD.replace(/LAST/gm,`${result.wdId}`)
            //    trackBody += RLabelWD;
            //}

            if (!Array.isArray(type.P175) && artistWD){
                artistWD = artistWD.replace(/LAST/gm,`${result.wdId}`)
                trackBody += artistWD
            } else {
                let artist = this.state.wdAlbum.result.entities[this.props.qid].claims.P175.map((item, index) => {
                    return item.mainsnak.datavalue.value.id;
                })
                for (let a = 0; a < type.P175.length; a++) {
                    if (artist.includes(type.P175[a].mainsnak.datavalue.value.id)) {
                        const index = artist.indexOf(type.P175[a].mainsnak.datavalue.value.id);
                        if (index > -1) {
                            artist.splice(index, 1);
                        }
                    }
                }
                if (artist !== undefined || artist.length !== 0){
                    for (let x = 0; x < artist.length; x++){
                        trackBody += `||${result.wdId}|P175|${artist[x]}`;
                    }
                }

            }

            if (!Array.isArray(type.P4404) && result.MBindex !== -1 && this.state.MB.tracks[result.MBindex].title !== 'ⓧ') {
                trackBody += `||${result.wdId}|${mbGroup}`;
            }

            if (!Array.isArray(type.P1552) && creativework) {
                creativework = creativework.replace(/LAST/gm,`${result.wdId}`)
                trackBody += creativework
            } else if (Array.isArray(type.P1552) && creativework) {
                let foundme1 = false;
                let foundme2 = false;
                for (let e = 0; e < type.P1552.length; e++) {
                    if (type.P1552[e].mainsnak.datavalue.value.id === 'Q15975575'){
                        foundme1 = true;
                    }
                    else if (type.P1552[e].mainsnak.datavalue.value.id === 'Q56123235'){
                        foundme2 = true;
                    }
                }
                if (!foundme1) trackBody += creativework2_69;
                if (!foundme2) trackBody += creativework2_39;
            }

            if (result.P1545 === 0) {
                 trackBody += `||${this.props.qid}|P658|${result.wdId}|P1545|"${result.nr}"`;
            }


            return trackBody;
        } else {
            alert("The album item is missing performer (P175)");
            return -1;
        }
    }

    async generateQS(result){
        //this.getWDlabel();
        if (this.props.qid){
            let cdQid = ["Q61629664","Q61629680","Q61747994","Q70931744"];
            let albQid = ["","","Q1242743","Q2712714"] //double and triple
            let tracks;
            let querytrack;
            let totTime = 0;
            let numberOfDisc = this.state.album.Tracks[this.state.album.Tracks.length - 1].disc_number;
            for (let z = 0; z < result.length; z++) {
                if (result[z].queryMatch && typeof result[z].wdId != 'undefined') {
                    tracks += (z ? '|' : '') + result[z].wdId;
                }
                totTime += this.state.album.Tracks[z].duration_ms;
            }
            if (tracks){
                tracks = await tracks.replace(/undefined/,'')
                if (tracks[0] === '|') tracks = await tracks.replace(/\|/,'')
                querytrack = await this.getSelectedAlbum(tracks);
            }
            let artistSpot = this.state.album.P175.map((item, index) => {
                return (index ? ', ' : '') + item.name
            })
            let bodyAlbum = '';
            let [year, month, day] = this.state.album.P577.split('-')

            if (result[0] === '%') {
                let P31 = "Q482994";
                let P175 = "Q5608"; //NEEDS TO FIND THE ARTIST NAME FROM WD!! FOR NEW ALBUM ITEM!
                //let headerAlbum = ",Len,Den,P31,P175";
                bodyAlbum = `
            }${this.state.album.Label},${year} album by ${artistSpot},${P31},${P175}`;
            }

            if (!Array.isArray(this.state.wdAlbum.result.entities[this.props.qid].claims.P31)) {
                let P31 = "Q482994";
                bodyAlbum += `||${this.props.qid}|P31|${P31}`;
            }

            if (!Array.isArray(this.state.wdAlbum.result.entities[this.props.qid].claims.P6500)) {
                //let P6500 = this.state.album.albumArt;
                //let P1065 = "https://cors-anywhere.herokuapp.com/https://archive.org/wayback/available?url=" + P6500;
                /*
                let request = await fetch(P1065);
                let result = await request.json();
                if (Object.keys(result.archived_snapshots).length !== 0){
                    bodyAlbum += `||${this.props.qid}|P6500|"${P6500}"|P1065|"${result.archived_snapshots.closest.url}"`;
                } else {
                    bodyAlbum += `||${this.props.qid}|P6500|"${P6500}"`;
                }
                 */

            }

            let P2205 = this.state.album.P2205;
            let P1810 = this.state.album.Label;
            if (!Array.isArray(this.state.wdAlbum.result.entities[this.props.qid].claims.P2205)) {
                bodyAlbum += `||${this.props.qid}|P2205|"${P2205}"|P1810|"${P1810}"`;
            } else {
                let found = false;
                for (let b = 0; b < this.state.wdAlbum.result.entities[this.props.qid].claims.P2205.length; b++){
                    if (this.state.wdAlbum.result.entities[this.props.qid].claims.P2205[b].mainsnak.datavalue.value === P2205){
                        found = true;
                        if (!this.state.wdAlbum.result.entities[this.props.qid].claims.P2205[b]?.qualifiers?.P1810) {
                            bodyAlbum += `||${this.props.qid}|P2205|"${P2205}"|P1810|"${P1810}"`;
                            break;
                        }
                    }
                }
                if (!found){
                    bodyAlbum += `||${this.props.qid}|P2205|"${P2205}"|P1810|"${P1810}"`;
                }
            }

            if (!Array.isArray(this.state.wdAlbum.result.entities[this.props.qid].claims.P577)) {
                let P577 = "+" + year + '-' + month + '-' + day + "T00:00:00Z/11";
                if (month === '01' && day === "01") P577 = "+" + year + "-01-01T00:00:00Z/9";
                bodyAlbum += `||${this.props.qid}|P577|${P577}`;
            }

            let P437 = "Q15982450"; //music streaming
            if (!Array.isArray(this.state.wdAlbum.result.entities[this.props.qid].claims.P2047)) {
                if (totTime > 0){
                    bodyAlbum += `||${this.props.qid}|P2047|${Math.floor(totTime / 1000)}U11574|P518|${P437}`;
                }
            }

            if (!Array.isArray(this.state.wdAlbum.result.entities[this.props.qid].claims.P3962)) {
                let barcode = this.state.album.Upc;
                bodyAlbum += `||${this.props.qid}|P3962|"${barcode}"`;
            }

            let P2635 = this.state.album.Tracks.length;
            if (!Array.isArray(this.state.wdAlbum.result.entities[this.props.qid].claims.P2635)) {
                let discnum = 1;
                let gestapo = '';
                if (numberOfDisc !== 1) {
                    for (let g = 0; g < this.state.album.Tracks.length;g++){
                        if (discnum !== this.state.album.Tracks[g].disc_number){
                            discnum = this.state.album.Tracks[g].disc_number
                            gestapo += `||${this.props.qid}|P2635|${this.state.album.Tracks[g - 1].track_number}U7302866|P518|${cdQid[discnum - 2]}`;
                        } else if (this.state.album.Tracks[g].track_number === this.state.album.Tracks[this.state.album.Tracks.length - 1].track_number && this.state.album.Tracks[g].disc_number === this.state.album.Tracks[this.state.album.Tracks.length - 1].disc_number) {
                            gestapo += `||${this.props.qid}|P2635|${this.state.album.Tracks[g].track_number}U7302866|P518|${cdQid[this.state.album.Tracks[g].disc_number - 1]}`;
                        }
                        discnum = this.state.album.Tracks[g].disc_number
                    }
                    if (numberOfDisc === 2 || numberOfDisc === 3) gestapo += `||${this.props.qid}|P7937|${albQid[numberOfDisc]}`
                    bodyAlbum += gestapo
                } else bodyAlbum += `||${this.props.qid}|P2635|${P2635}U7302866|P518|${P437}`;

            } else {
                let found2 = false;
                for (let b = 0; b < this.state.wdAlbum.result.entities[this.props.qid].claims.P2635.length; b++){
                    if (parseInt(this.state.wdAlbum.result.entities[this.props.qid].claims.P2635[b].mainsnak.datavalue.value.amount) === P2635 || this.state.wdAlbum.result.entities[this.props.qid].claims.P2635[b]?.qualifiers?.P518){
                        found2 = true;
                        if (!this.state.wdAlbum.result.entities[this.props.qid].claims.P2635[b]?.qualifiers?.P437 && !this.state.wdAlbum.result.entities[this.props.qid].claims.P2635[b]?.qualifiers?.P518) {
                            bodyAlbum += `||${this.props.qid}|P2635|${P2635}U7302866|P437|${P437}`;
                            break;
                        }
                    }
                }
                if (!found2){
                    bodyAlbum += `||${this.props.qid}|P2635|${P2635}U7302866|P437|${P437}`;
                }
            }


            if (!Array.isArray(this.state.wdAlbum.result.entities[this.props.qid].claims.P437)) {
                bodyAlbum += `||${this.props.qid}|P437|${P437}`;
            } else {
                let found3 = false;
                for (let b = 0; b < this.state.wdAlbum.result.entities[this.props.qid].claims.P437.length; b++){
                    if (this.state.wdAlbum.result.entities[this.props.qid].claims.P437[b].mainsnak.datavalue.value.id === P437){
                        found3 = true;
                        break
                    }
                }
                if (!found3){
                    bodyAlbum += `||${this.props.qid}|P437|${P437}`;
                }
            }

            if (this.state.album.Label.toLowerCase() === this.state.album.P175[0].name.toLowerCase()) {
                let P1552 = "Q11999895" //eponymously titled
                if (!Array.isArray(this.state.wdAlbum.result.entities[this.props.qid].claims.P1552)) {
                    bodyAlbum += `||${this.props.qid}|P1552|${P1552}`;
                } else {
                    let found4 = false;
                    for (let b = 0; b < this.state.wdAlbum.result.entities[this.props.qid].claims.P1552.length; b++) {
                        if (this.state.wdAlbum.result.entities[this.props.qid].claims.P1552[b].mainsnak.datavalue.value.id === P1552){
                            found4 = true;
                            break;
                        }
                }
                if (!found4){
                    bodyAlbum += `||${this.props.qid}|P1552|${P1552}`;
                }
                }
            }

            if (!Array.isArray(this.state.wdAlbum.result.entities[this.props.qid].claims.P436) && this.state.MB.releaseGroups) {
                bodyAlbum += `||${this.props.qid}|P436|"${this.state.MB.releaseGroups}"|P1810|"${this.state.MB.titleGr}"`;
            }

            if (!Array.isArray(this.state.wdAlbum.result.entities[this.props.qid].claims.P1476)) {
                let P1476 = this.state.album.Label;
                if (P1476 === P1476.toUpperCase()) {
                    P1476 = P1476.toLowerCase();
                    P1476 = P1476.replace(/(^\w{1})|(\s{1}\w{1})/g, match => match.toUpperCase());
                }
                bodyAlbum += `||${this.props.qid}|P1476|mul:"${P1476}"`;
            }

            if (numberOfDisc === 1) {
                for (let f = 0; f < result.length; f++) {
                    if (!result[f].skip){
                        let tempBoyd = this.QSitem(result[f], querytrack);
                        if (tempBoyd === -1) break;
                        bodyAlbum += (' ' + tempBoyd).slice(1);
                    }
                }
            } else alert("Multi-disc releases not yet supported by MoeData - use at own risk");
            bodyAlbum = await bodyAlbum.replace(/undefined/gm,'');
            bodyAlbum = await bodyAlbum.replace(/&/gm,'﹠');
            //bodyAlbum = await bodyAlbum.replace(/\|/gm,'%09');
            //bodyAlbum = await bodyAlbum.replace(/"/gm,'%22');
            //bodyAlbum = await bodyAlbum.replace(/\//gm,'%2F');

            console.log("Raw QS:", bodyAlbum);
            window.open(
              "https://tools.wmflabs.org/quickstatements/index_old.html#v1=" + bodyAlbum , "_blank");//+ "%0A"

        } else alert("Missing Wikidata item (album)! You want to create an album item? That is not implemented, yet!")
    }

    MatchWD(indexNr, spotTrack) {
        if (this.state.wdTrack.Loading === false) {
            let tracksAlbum = '';
            if (Array.isArray(this.state.wdAlbum.result.entities[this.props.qid].claims.P658)) {
                tracksAlbum = this.state.wdAlbum.result.entities[this.props.qid].claims.P658.map((item, index) => {
                    if (item.qualifiers && typeof item.qualifiers.P1545 !== 'undefined') return {
                        label: this.state.wdTrack.result.entities[item.mainsnak.datavalue.value.id].labels.en.value,
                        alias: this.state.wdTrack.result.entities[item.mainsnak.datavalue.value.id].aliases.en,
                        id: item.mainsnak.datavalue.value.id,
                        P1545: parseInt(item.qualifiers.P1545[0].datavalue.value),
                        queryMatch: false
                    };
                    else return {
                        label: this.state.wdTrack.result.entities[item.mainsnak.datavalue.value.id].labels.en.value,
                        alias: this.state.wdTrack.result.entities[item.mainsnak.datavalue.value.id].aliases.en,
                        id: item.mainsnak.datavalue.value.id,
                        P1545: 0,
                        queryMatch: false
                    }
                })
                if (Array.isArray(tracksAlbum)) {
                    for (let i = 0; i < tracksAlbum.length; i++) {
                        if (tracksAlbum[i].P1545 !== 0) {
                            if (tracksAlbum[i].P1545 === indexNr) {
                                return tracksAlbum[i];
                            }
                        } else {
                            if (spotTrack.toLowerCase() === tracksAlbum[i].label.toLowerCase()) return tracksAlbum[i];
                            else if (spotTrack.toLowerCase().replace(/ *\([^)]*\) */g, "") === tracksAlbum[i].label.toLowerCase()) return tracksAlbum[i];
                            else if (spotTrack.toLowerCase().replace(/..[^-]+$/g,"") === tracksAlbum[i].label.toLowerCase()) return tracksAlbum[i];
                            else if (typeof tracksAlbum[i].alias !== 'undefined' && spotTrack.toLowerCase() === tracksAlbum[i].alias[0].value.toLowerCase()) return tracksAlbum[i];
                        }
                    }
                } else console.log("404:", tracksAlbum)
            }
            if (this.state.wdQuery.Loading === false) {
                for (let c = 0; c < this.state.wdQuery.result.results.bindings.length; c++) {
                    let pat = this.state.wdQuery.result.results.bindings[c].item_label.value;
                    let id = this.state.wdQuery.result.results.bindings[c].item.value;
                    if (pat.toLowerCase() === spotTrack.toLowerCase()) return {id: id.substr(id.lastIndexOf('/') + 1), label: pat, queryMatch: true, P1545: 0};
                    else if (pat.toLowerCase() === spotTrack.toLowerCase().replace(/ *\([^)]*\) */g, "")) return {id: id.substr(id.lastIndexOf('/') + 1), label: pat, queryMatch: true, P1545: 0};
                    else if (pat.toLowerCase().replace(/ *\([^)]*\) */g, "") === spotTrack.toLowerCase().replace(/ *\([^)]*\) */g, "")) return {id: id.substr(id.lastIndexOf('/') + 1), label: pat, queryMatch: true, P1545: 0};
                    else if (pat.toLowerCase() === spotTrack.toLowerCase().replace(/..[^-]+$/g, "")) return {id: id.substr(id.lastIndexOf('/') + 1), label: pat, queryMatch: true, P1545: 0};

                }

            }

            return ''
        }
    }

    async MusicBrainz () {
        let url;
        if (this.state.wdAlbum.result.entities[this.props.qid].claims.P436) {
            const relID = encodeURIComponent(this.state.wdAlbum.result.entities[this.props.qid].claims.P436[0].mainsnak.datavalue.value)
            url = `https://musicbrainz.org/ws/2/release-group/?query=rgid:${relID}&fmt=json`;
        } else {
            let title;
            if (this.state.wdAlbum.result.entities[this.props.qid].labels?.en?.value) title = encodeURIComponent(this.state.wdAlbum.result.entities[this.props.qid].labels.en.value);
            else title = encodeURIComponent(this.state.album.Label);
            const artist1 = encodeURIComponent(this.state.album.P175[0].name);
            url = `https://musicbrainz.org/ws/2/release-group/?query=release:${title}%20AND%20artist:${artist1}&fmt=json`;
        }
        const response = await fetch(url);
        const data = await response.json();
        let release = -1;
        for (let h = 0; h < data["release-groups"].length; h++) {
            for (let u = 0; u < data["release-groups"][h].releases.length; u++) {
                if (data["release-groups"][h].score > 97 && data["release-groups"][h].releases[0].status === 'Official') {
                    release = h;
                    break;
                }
            }
            if (release !== -1) break;
        }
        if (release !== -1) {
            const titleGr = data["release-groups"][release].title;
            const releaseGroups = data["release-groups"][release].id;
            let reid;
            let found = false;
            for (let o = 0; o < data["release-groups"][release].releases.length; o++) {
                if (data["release-groups"][release].releases[o].status === "Official") {
                    found = true;
                    reid = data["release-groups"][release].releases[o].id;
                    break;
                }
            }
            const url2 = `https://musicbrainz.org/ws/2/recording/?query=reid:${reid}&fmt=json`;
            const response2 = await fetch(url2);
            const data2 = await response2.json();
            if (data2.recordings.length > this.state.album.Tracks.length - 5) {
                this.setState({
                    ...this.state,
                    MB: {Loading: false, releaseGroups: releaseGroups, titleGr: titleGr, tracks: data2.recordings}
                })
                return "";
            }
        }
        this.setState({
            ...this.state,
            MB: {Loading: false, releaseGroups: '', tracks: []}
        });
    }

    regexName (inputName) {
        let name = inputName;
        if (!inputName.match(/\s-\s(?=[^-]*$).*[R|r]emix/g)) name = inputName.replace(/\s-\s(?=[^-]*$).*/g,'');
        name = name.replace(/ *\([f|F]eat[^)]*\) */g,'');
        name = name.replace(/ *\([w|W]ith[^)]*\) */g,'');
        name = name.replace(/ *\([m|M]ed[^)]*\) */g,'');
        name = name.replace(/ *\([i|I]nterlude[^)]*\) */g,'');
        if (name === '') name = inputName;
        name = name.replace(/[^a-zA-Z0-9 ]/g,"");
        return name;
    }

    onUpdateItem = i => {
        this.setState(state => {
            const list = state.MB.tracks.map((item, j) => {
                if (j === i) {
                    return item.title = "ⓧ";
                } else {
                    return item;
                }
            });
            return {
                list,
            };
        });
    };


  render() {
      //setTimeout(() => { if (this.state.album.P2635 === 0) return <Redirect to={{pathname: "/404"}}/>; }, 4000);

      const MaaLoader = () => <MyLoader/>;

      let qidAlbum;
      if (this.props.qid) {
          qidAlbum = <span className="barcode" style={{fontSize: "20px"}}>(<a
              href={`https://www.wikidata.org/wiki/${this.props.qid}`}>{this.props.qid}</a>)</span>;
      }

      let wdArtist = [];

      if (this.state.wdAlbum.Loading === false) {
          const artistWD = Object.values(this.state.wdLabel.result.entities);
          let wdid = '';
          for (let u = 0; u < artistWD.length; u++) {
              let temp = [];
              wdid = artistWD[u].id;
              let languages = Object.values(artistWD[u].labels);
              for (let v = 0; v < languages.length; v++) {
                  temp.push(languages[v].value)
              }
              wdArtist.push({id: wdid, value: temp});
          }
      }

      let P31 = this.state.album.P31

      let names = Array.isArray(this.state.album.P175) && this.state.album.P175.map((item, index) => {
          let artistqid = '';
          if (Array.isArray(wdArtist) && wdArtist.length) {
              for (let q = 0; q < wdArtist.length; q++) {
                  for (let w = 0; w < wdArtist[q].value.length; w++) {
                      if (wdArtist[q].value[w].toLowerCase() === this.regexName2(item.name).toLowerCase()) {
                          artistqid = wdArtist[q].id
                          break;
                      }
                  }
                  if (artistqid !== '') break;
              }

          }
          return (<span key={index+1}><a style={{Display: 'inline-block'}} key={`/artist/${item.id}`} href={`/artist/${item.id}`}>{(index ? ', ' : '') + item.name}</a><a href={`https://www.wikidata.org/wiki/${artistqid}`}><span key={`/wd/${artistqid}`} className="barcode" style={{fontSize: "12px"}}>{(artistqid ? ' (' + artistqid + ')' : '')}</span></a></span>)
      })

      let stop = <svg viewBox="0 0 1000 1000" width={20} height={20} ><path d="M846.5 153.5c-191.4-191.4-501.6-191.4-693 0s-191.4 501.6 0 693 501.6 191.4 693 0c191.3-191.4 191.3-501.6 0-693zm-86.6 86.6c128.8 128.8 142 329.3 39.7 472.8L287.1 200.4c143.5-102.2 344-89 472.8 39.7zM240.1 759.9c-128.8-128.8-142-329.3-39.7-472.8l512.5 512.5c-143.5 102.2-344 89-472.8-39.7z" fill="#d60005"/></svg>;
      let skip =  <svg viewBox="0 0 1000 1000" width={20} height={20} ><path d="M990 494.2c0-10.2-4.4-19.3-11.3-25.7l-386.8-334c-6.2-5.2-14-8.5-22.7-8.5-19.4 0-35.1 15.7-35.1 35.1V309C238.5 356.6 30.3 573.9 10 852.9c1 11.8 10.6 21.2 22.7 21.2 4.6 0 9-1.4 12.7-3.8.1-.1 0 .2.1.2 51.1-36.3 95.2-63.3 129.7-81.5 62.8-34.6 151.6-64.1 253.6-83v-.2c14.6 0 26.4-12.1 26.4-27s-11.8-27-26.4-27c-3.4 0-6.6.7-9.6 1.9-163.3 32-270.9 84.1-355.3 144.5 54.5-200.3 188.3-380.5 502.8-439.7 13.9-2.3 24.5-14.6 24.5-29.6V215l325.7 279.3L594.7 770h-2.4V634h-.1c-.9-15.7-13.6-28.1-29-28.1-16.1 0-29.1 13.4-29.1 30V828c0 19.4 15.6 35.1 35.1 35.1 8.3 0 15.7-3.1 21.7-7.9L977.8 521l-.1-.1c7.5-6.4 12.3-16 12.3-26.7z" fill="#f08600"/></svg>;
      let table;
      let loading;
      let header;
      let result = [];

      if ((this.state.MB.Loading && this.props.qid) || this.state.MB.Loading) {
          loading = (
              <div className="album-tracklist">
                  {Array(10)
                      .fill("")
                      .map((e, i) => (
                          <MaaLoader key={i} style={{opacity: Number(2 / i).toFixed(1)}}/>
                      ))}
              </div>)
      } else {
          header = (
              <tr>
                  <td>#</td>
                  <td>Title</td>
                  <td>Artist(s)</td>
                  <td>ISRC</td>
                  <td>Length</td>
                  <td>MusicBrainz</td>
                  <td>Wikidata item</td>
              </tr>
          );

          table = Array.isArray(this.state.album.Tracks) && this.state.album.Tracks.map((item, index) => {
              let artist = item.artists.map((item2, index2) => {
                  return (index2 ? ', ' : '') + item2.name;
              });
              let t = item.duration_ms / 1e3,
                  n = Math.floor(t % 60).toString(),
                  a = n.length < 2 ? "0".concat(n) : n,
                  r = Math.floor(t / 60);
              let minutes = "".concat(r, ":").concat(a);
              let wdmatch = this.MatchWD(index + 1, item.name);
              let wdStatus = "ⓧ";
              if (wdmatch && this.props.qid){
                  wdStatus = <a style={{fontSize: "16px", display: "inline-block"}} href={`https://www.wikidata.org/wiki/${wdmatch.id}`}>{wdmatch.label} <span className="barcode">({wdmatch.queryMatch ? "*" : ''}{wdmatch.id})</span></a>;
              }
              let MBindex = -1;
              for (let z = 0; z < this.state.MB.tracks.length; z++) {
                  if ((Array.isArray(this.state.MB.tracks[z].isrcs) && this.state.MB.tracks[z].isrcs[0] === this.state.album.Tracks2[index].isrc) || this.regexName(item.name).toLowerCase() === this.state.MB.tracks[z].title.replace(/[^a-zA-Z0-9 ]/g,"").toLowerCase()) {
                      MBindex = z;
                      break;
                  }
              }

              if (!this.state.MB.Loading) {
                  if (this.props.qid) {
                      if (wdmatch) result.push({nr: index + 1, spotTitle: item.name, wdTitle: wdmatch.label, wdId: wdmatch.id, queryMatch: wdmatch.queryMatch, P1545: wdmatch.P1545, spotArtist: artist, wdStatus: wdStatus, minutes: minutes, skip: false, MBindex: MBindex})
                      else result.push({nr: index + 1, spotTitle: item.name, wdTitle: '' ,wdId: '' , queryMatch: false, P1545: 0, spotArtist: artist, wdStatus: wdStatus, minutes: minutes, skip: false, MBindex: MBindex})
                  } else result.push({nr: index + 1, spotTitle: item.name, wdTitle: '' ,wdId: '' , queryMatch: false, P1545: 0, spotArtist: artist, wdStatus: wdStatus, minutes: minutes, skip: false, MBindex: MBindex})
              }

              if (!this.state.MB.Loading){
                  return (
                      <tr key={index + 1}>
                          <td>{result[index].nr}.</td>
                          <td><a href={item.external_urls.spotify}> "{item.name}" </a></td>
                          <td>{artist}</td>
                          <td className="isrc">{this.state.album.Tracks2[index].isrc}</td>
                          <td>{result[index].minutes}</td>
                          <td>{this.state.MB.tracks[MBindex] ?
                              <div><a href={`https://beta.musicbrainz.org/recording/${this.state.MB.tracks[MBindex].id}`}>"{this.state.MB.tracks[MBindex].title}"</a> <a style={{display: "inline-block", cursor: "pointer"}} onClick={() => {
                                  this.onUpdateItem(MBindex);
                                  console.log(`Removed match to MB track registered!`)
                              }}>{stop}</a></div> : "ⓧ"}</td>
                          <td ref={this.myRef}>{result[index].wdStatus}&nbsp;<a style={{display: "inline-block", cursor: "pointer"}} onClick={() => {let ind = index; result[ind].wdStatus = "ⓧ"; result[ind].wdId = ''; result[ind].P1545 = 0; result[ind].queryMatch = false; console.log(`Removed match of track ${ind+1} registered!`)}}>{stop}</a>&nbsp;<a style={{display: "inline-block", cursor: "pointer"}} onClick={() => {let ind = index; result[ind].skip = true;console.log(`Skip of track ${ind+1} registered!`)}}> {skip} </a></td>
                      </tr>
                  )
              }
          });
      }
      /*
      let copyIdiot = Array.isArray(this.state.album.Copyrights) && this.state.album.Copyrights.map((item, index) => {
          if (item.type === "P") {
              let shit = item.text.replace(/\(P\)/,"&#8471;")
              return <div key={index}>{ReactHtmlParser(shit)}</div>;
          } else return ''
      })
       */
      let indexval = false;
      let MBrelGr;
      if (this.state.MB.releaseGroups){
          MBrelGr = <div><span className="bold">MusicBrainz: </span><a href={`https://beta.musicbrainz.org/release-group/${this.state.MB.releaseGroups}`}>{this.state.MB.releaseGroups}</a></div>
      }
      let relDate;

      if (this.state.album.P577){
          let options = { year: 'numeric', month: 'long', day: 'numeric' };
          let d = new Date(this.state.album.P577);
          relDate = d.toLocaleDateString("en-US", options);
      }


      return (
          <div className="main-wrapper">
              <div className="album-summary">
                  <img className="album-cover" src={this.state.album.albumArt} alt="Album cover"/>
                  <div className="album-metadata">
                      <div className="bold"><h1>{this.state.album.Label} {qidAlbum}</h1></div>
                      <div>{P31} by {names}</div>
                      <div><span className="bold">Label: </span>{this.state.album.P264}</div>
                      {MBrelGr}
                      <div><span className="bold">Release date: </span>{relDate}</div>
                      <div><span className="bold">Barcode: </span><span
                          className="barcode">{this.state.album.Upc}</span>
                      </div>
                      <div style={{display: "flex"}}>
                          {stop}
                          <span>&nbsp;Unmatch this track and create new.&nbsp;</span>
                          {skip}
                          <span >&nbsp;Skip this track (no creation). No feedback on buttons.</span>
                      </div>
                  </div>
                  {loading}
                  <table className="album-tracklist">
                      <tbody>
                      {header}
                      {table}
                      </tbody>
                  </table>
                  <div className="footer-button">
                      <button className="buttonWD" onClick={() => alert("Not implemented, yet!")}>Import to Wikidata</button>
                      <button className="buttonQS" onClick={() => {this.generateQS([...result])}}>{indexval ? 'Loading...' : 'QuickStatements (QS)'}</button>
                  </div>
              </div>
          </div>
      );
  }
}

export default SpotifyHandler;
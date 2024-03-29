import { useCallback, useRef, useContext, useEffect, useState  } from "react";
import { useMemoRooms } from "../../hooks/useMemoRooms";
import ContactLink from "../ContactLink/ContactLink";
import ProfileModal from './../ProfileModal/ProfileModal'
import './ContactList.scss'
import CreateChatRoom from "../CreateChatRoom/CreateChatRoom";
import { observer } from "mobx-react-lite";
import { Context } from "../..";
import LoaderCircle from "../ui/Loader/LoaderCircle";
import { getRooms } from "../../http/chatAPI";
import { useParams } from "react-router-dom";

const ContactList = observer(({
	// roomId, 
	// lastSentMessage, 
	// roomsList, 
	// setRoomsList,
	socket
}) => {

	const {user, rooms} = useContext(Context)
	const datesOfLastReadMessages = {...user.currentUser}.lastReadMessage
	const [groupChat, setGroupChat] = useState(true)
	const [serachActive, setSerachActive] = useState(false)
	const [searchValue, setSearchValue] = useState('')
	const [showProfile, setShowProfile] = useState(false)
	const [loadingContacts, setLoadingContacts] = useState(false)
	const serachInputRef = useRef(null)
	const arrayOfRooms = useMemoRooms(rooms.roomsList, searchValue)
  const { id: roomId } = useParams()

  const getAllowedRoomsWhithLastMessage = useCallback (
		async ()=> {
			setLoadingContacts(true)
      try {
				const {data} = await getRooms()
        // setRoomsList(data)
				rooms.initRoomsList(data)
      } catch (e) {
        console.log(e.status)
      } finally {
				setLoadingContacts(false)
			}
		},[]
	) 

	useEffect (()=> {
		if (serachActive) serachInputRef.current.focus()
	},[serachActive])
	

	useEffect(()=> {
			getAllowedRoomsWhithLastMessage()
	},[getAllowedRoomsWhithLastMessage])

	const openProfile = () => {
		setShowProfile(true)
	}

	const closeSearch = (event)=> {
		setSerachActive(false)
	}
		
	const switchSingle = (event)=> {
		setGroupChat(false)
	}

	const switchGroup = (event)=> {
		setGroupChat(true)
	}

	const hideSearchInput = (event)=> {
		if (!event.target.classList.contains('searchChat') &&
				!event.target.classList.contains('searchInputContainer') && 
			  event.target != serachInputRef.current) {
			setSerachActive(false)
		}
	}
	
	function renderButtons (className) {
		if (serachActive) {
			return 'hide'
		}
		if (groupChat && className === 'groupChat') {
			return `groupChat active`
		} else if (groupChat && className === 'singleChat') {
			return `singleChat`
		}
	
		if (!groupChat && className === 'groupChat') {
			return `groupChat`
		} else if (!groupChat && className === 'singleChat') {
			return `singleChat active`
		}
	}
	return (
		<div className="leftToolBar" onClick={hideSearchInput}>
			<ProfileModal 
				show={showProfile} 
				setShow={setShowProfile}
				socket={socket}
			/>
			{!loadingContacts? 
				<div className="profile">
					<div className="avatar">
						<img src={process.env.REACT_APP_API_URL + {...user.currentUser}.avatar} alt='Photo'></img>
					</div>
					<div className="name"> {{...user.currentUser}.name} </div>
					<button className="settings" onClick={openProfile}/>
				</div> 
			:
				<div className="profile">
					<LoaderCircle/>
				</div>
			}
			{!loadingContacts? 
				<div className="contactList">
					{arrayOfRooms.map(room=> 
						<ContactLink
							id={room.id} 
							key={room.id}
							avatar={room.image} 
							currentId={roomId} 
							name={room.name}
							lastMessage={room.messageText}
							dateOfLastMessage={room.date}
							sender={room.sender}
							// lastSentMessage={lastSentMessage}
							currentUserId={{...user.currentUser}.userId}
							dateOfLastReadMessage ={datesOfLastReadMessages[room.id]}
						/>
					)}
				</div>
			:
				<div className="contactList">
					<LoaderCircle/>
				</div>
			}
			{/* <CreateChatRoom setRoomsList={setRoomsList}/> */}
			<div className="lowerToolBar">
				<div className="buttons-icons">
					<button className={renderButtons('groupChat')} onClick={switchGroup}/>
					<button className={renderButtons('singleChat')} onClick={switchSingle}/>
					<button className={!serachActive? 'searchChat' : 'hide'} onClick={()=>setSerachActive(true)}/>
					<div className={serachActive? 'searchInputContainer' : 'hide'}>
						<input 
							value={searchValue} 
							onChange={event => setSearchValue(event.target.value)}
							type="text" 
							className='searchInput' 
							ref={serachInputRef}/>
						<button className="closeButton" onClick={closeSearch}></button>
					</div>
				</div>
			</div>
		</div>
	)
})

export default ContactList;
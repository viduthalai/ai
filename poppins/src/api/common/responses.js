exports.constants= {
    WELCOME_TEXT:"Hi, Care.com here!  To learn about routines, where to find things, and who to call in case of emergencies, just ask!",
    WELCOME_TEXT_HAS_NOTE:"Hi, Care.com here!  To learn about routines, where to find things, and who to call in case of emergencies, just ask! Would you like to hear the important note {seeker_name} left for you?",
    IMPORTANT_DETAILS_TEXT:"Ok, here you go: {important_note}",
    IMPORTANT_NOTE_NOT_FOUND:"All clear! {seeker_name} did not leave any important notes for you.",
    SEEKER_NAME_PLACEHOLDER:"{seeker_name}",
    IMPORTANT_DETAIL_PLACEHOLDER:"{important_note}",
    CONTACT_NAME_PLACEHOLDER:"{contact_name}",
    RELATIONSHIP_PLACEHOLDER:"{relationship}",
    RELATIONSHIPS_PLACEHOLDER:"{relationships}",
    PHONE_NUMBER_PLACEHOLDER:"{phone_number}",
    ITEM_PLACEHOLDER:"{item}",
    ITEMS_PLACEHOLDER:"{items}",
    LOCATION_PLACEHOLDER:"{location}",
    NOTE_PLACEHOLDER:"{note}",
    ANSWER_NOT_FOUND_FALLBACK:"Sorry, I don't know.",
    NOT_FOUND:"NOT_FOUND",
    INTENT_NOT_FOUND_FALLBACK: "Sorry. I didn't catch that. Can you say that a different way?",
    EXIT: "Great! Till next time.",
    WHERE_TO_FIND_TEXT: "Check the {location} for the {item}. {note}",
    EMERGENCY_CONTACT_TEXT:"You can call {contact_name}, {relationship}, at {phone_number}",
    WHERE_TO_FIND_FALLBACK:"Sorry, {seeker_name} didn't leave info for you about that.",
    EMERGENCY_CONTACT_FALLBACK:"{seeker_name} did not provide any emergency contact. Please call 911 for true emergency.",
    FOLLOWUP_QUESTION_SSML: "<break time='700ms'/>Anything else you want to know?",
    FOLLOWUP_QUESTION_TEXT: "Anything else you want to know?",
    FOLLOWUP_QUESTION_CONFIRMATION: "Okay, what would you like to know?",
    MAX_FAILURE_EXIT: "Sorry I can't help with this. Goodbye.",
    LAST_CHANCE:"Sorry I can't help with this. Do you want to hear the emergency contact number?",
    LAST_CHANCE_NO:"Have a nice day. Goodbye.",
    LAST_CHANCE_EMERGENCY_CONTACT:"You can call {contact_name}, {relationship}, at {phone_number}. Goodbye.",
    WHERE_TO_FIND_NOT_FOUND:"I don't know where to find {item}. But I can tell you where to check for other items. Would you like to hear that?",
    WHERE_TO_FIND_NOT_FOUND_SINGLE:"I don’t know where to find {item}. But I can tell you where to find the {items}. Would you like to hear that?",
    WHERE_TO_FIND_YES:"I can tell you about {items}. What would you like to know?",
    EMERGENCY_CONTACT_NONE_SPECIFIED: "{seeker_name} didn't leave any emergency contacts for you. If this is a true emergency, call 911 now.",
    EMERGENCY_CONTACT_MORE_CONTACTS: "Do you want to hear contact info for {relationships}?",
    EMERGENCY_CONTACT_MORE_FALLBACK: "To hear more contact info, please say {relationships}.",
    EMERGENCY_CONTACT_RELATIONSHIP_NOT_FOUND: "Sorry, {seeker_name} didn't leave a contact for {relationship}. If you want to hear the contact info for {relationships}, say {relationships}",
    NO_INTENT_FALLBACK_1:"Sorry. I didn't catch that. Can you say that a different way?",
    NO_INTENT_FALLBACK_2:"I can answer questions about routines, emergency contacts, and where to find things. Please try again.",
    contexts : {
        WELCOME:"defaultwelcomeintent-followup",
        DEFAULT_FALLBACK_EMERGENCY_CONTACT_CONTEXT:"fallback-emergency-contact-context",
        EMERGENCY_CONTACT_CONTEXT: "emergencycontact-followup",
        NO_INTENT_CONTEXT: "no-intent"
    },
    responseIds : {
        INTENT_NOT_FOUND: -1,
        RESPONSE_NOT_FOUND: -2,
        SYSTEM_ERROR: -3,
        EXIT: -4,
        DECLINE: -5
    },
    operators : {
        space : ' '
    },
    type : {
        CLOSE_MIC: "CLOSE_MIC",
        ADD_DEFAULT_QUESTION:'ADD_DEFAULT_QUESTION',
        NO_DEFAULT_QUESTION:'NO_DEFAULT_QUESTION'
    }
}
exports.WhereToFind = {
		CONTEXTS : {
	        WHERE_TO_FIND_YES_OR_NO:"wheretofind-yes-or-no",
	        WHERE_TO_FIND_YES_OR_NO_SINGLE:"wheretofind-single-followup",
	        WHERE_TO_FIND_SELECT_ITEM:"wheretofind-select-item",
	        ACTIONS_INTENT_OPTION:"actions_intent_option",
		}
}
exports.Routines = {
	    CONTEXTS : {
	        "followup_single" : "dailyroutine-followup-single",
	        "followup" : "dailyroutine-followup",
	    },
	    NONE_SPECIFIED: "%s didn't set up tasks to share with you.",
	    NONE_REQUESTED_SINGLE: "I can tell you about the %s routine. Would you like to hear that?",
	    NONE_REQUESTED_MULTI: "I can tell you about the %s routine. Which one would you like to know?",
	    NOT_FOUND: "%s didn't set up any %s tasks to share with you. If you want to hear the %s routines, say %s.",
	    FOUND: "Here are the %s tasks: %s",
}

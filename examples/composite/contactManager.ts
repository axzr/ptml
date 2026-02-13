const contactManager = `
state:
- searchQuery:
- selectedContactId:
- editingContactId:
- showAddForm: false
- groupBy: "none"
- newContactName:
- newContactEmail:
- newContactPhone:
- newContactAddress:
- newContactNotes:
- editContactName:
- editContactEmail:
- editContactPhone:
- editContactAddress:
- editContactNotes:

recordList: contacts
- record:
  - id: 1
  - name: John Doe
  - email: john@example.com
  - phone: 555-0100
  - address: 123 Main St, City, State 12345
  - notes: Friend from college
- record:
  - id: 2
  - name: Jane Smith
  - email: jane@example.com
  - phone: 555-0101
  - address: 456 Oak Ave, City, State 12346
  - notes: Work colleague
- record:
  - id: 3
  - name: Bob Johnson
  - email: bob@example.com
  - phone: 555-0102
  - address: 789 Pine Rd, City, State 12347
  - notes: Neighbor
- record:
  - id: 4
  - name: Alice Williams
  - email: alice@example.com
  - phone: 555-0103
  - address: 321 Elm St, City, State 12348
  - notes: Family friend

function: addContact name email phone address notes
- addRecord: contacts
  - record:
    - id: $contacts.length
    - name: name
    - email: email
    - phone: phone
    - address: address
    - notes: notes
- set: $showAddForm false
- clear: newContactName
- clear: newContactEmail
- clear: newContactPhone
- clear: newContactAddress
- clear: newContactNotes

function: startEdit name email phone address notes
- set: $editContactName name
- set: $editContactEmail email
- set: $editContactPhone phone
- set: $editContactAddress address
- set: $editContactNotes notes

function: updateContact contactId name email phone address notes
- updateRecord: contacts
  - where: id is contactId
  - record:
    - id: contactId
    - name: name
    - email: email
    - phone: phone
    - address: address
    - notes: notes

function: deleteContact contact
- removeRecord: contacts $contact

function: cancelEdit
- set: $editingContactId
- clear: editContactName
- clear: editContactEmail
- clear: editContactPhone
- clear: editContactAddress
- clear: editContactNotes

function: toggleAddForm
- set: $showAddForm !$showAddForm

function: setGroupBy groupType
- set: $groupBy $groupType

define: app-container
- display: flex
- flex-direction: column
- padding: 2em
- max-width: 1400px
- margin: 0 auto
- font-family: Arial, sans-serif
- background-color: #f5f5f5
- min-height: 100vh

define: app-header
- display: flex
- justify-content: space-between
- align-items: center
- margin-bottom: 2em
- padding-bottom: 1em
- border-bottom: 3px solid #3498db

define: app-title
- font-size: 2.5em
- font-weight: bold
- color: #2c3e50
- margin: 0

define: header-actions
- display: flex
- gap: 1em
- align-items: center

define: add-button
- padding: 0.75em 1.5em
- background-color: #3498db
- color: white
- border: none
- border-radius: 5px
- cursor: pointer
- font-size: 1em
- font-weight: bold
- if: $showAddForm is true
  - background-color: #e74c3c

define: search-container
- display: flex
- gap: 1em
- margin-bottom: 2em
- padding: 1em
- background-color: white
- border-radius: 5px
- box-shadow: 0 2px 4px rgba(0,0,0,0.1)

define: search-input
- flex: 1
- padding: 0.75em
- border: 2px solid #ddd
- border-radius: 5px
- font-size: 1em

define: group-selector
- display: flex
- gap: 0.5em
- align-items: center

define: group-button
- padding: 0.5em 1em
- background-color: #95a5a6
- color: white
- border: none
- border-radius: 3px
- cursor: pointer
- font-size: 0.9em
- if: $groupBy is groupType
  - background-color: #3498db

define: form-container
- margin-bottom: 2em
- padding: 1.5em
- background-color: white
- border-radius: 5px
- box-shadow: 0 2px 4px rgba(0,0,0,0.1)

define: form-title
- font-size: 1.3em
- font-weight: bold
- margin-bottom: 1em
- color: #2c3e50

define: form-grid
- display: grid
- grid-template-columns: repeat(2, 1fr)
- gap: 1em
- margin-bottom: 1em

define: form-full-width
- grid-column: 1 / -1

define: form-label
- display: block
- margin-bottom: 0.5em
- font-weight: bold
- color: #555

define: form-input
- width: 100%
- padding: 0.75em
- border: 2px solid #ddd
- border-radius: 5px
- font-size: 1em
- box-sizing: border-box

define: form-textarea
- width: 100%
- padding: 0.75em
- border: 2px solid #ddd
- border-radius: 5px
- font-size: 1em
- min-height: 100px
- resize: vertical
- box-sizing: border-box
- font-family: Arial, sans-serif

define: form-buttons
- display: flex
- gap: 1em
- justify-content: flex-end
- margin-top: 1em

define: save-button
- padding: 0.75em 1.5em
- background-color: #2ecc71
- color: white
- border: none
- border-radius: 5px
- cursor: pointer
- font-size: 1em
- font-weight: bold

define: cancel-button
- padding: 0.75em 1.5em
- background-color: #95a5a6
- color: white
- border: none
- border-radius: 5px
- cursor: pointer
- font-size: 1em

define: contacts-container
- background-color: white
- border-radius: 5px
- box-shadow: 0 2px 4px rgba(0,0,0,0.1)
- padding: 1.5em

define: contacts-header
- display: flex
- justify-content: space-between
- align-items: center
- margin-bottom: 1.5em
- padding-bottom: 1em
- border-bottom: 2px solid #eee

define: contacts-title
- font-size: 1.5em
- font-weight: bold
- color: #2c3e50

define: contacts-count
- color: #7f8c8d
- font-size: 0.9em

define: group-header
- font-size: 1.2em
- font-weight: bold
- color: #3498db
- margin-top: 1.5em
- margin-bottom: 0.5em
- padding-bottom: 0.5em
- border-bottom: 1px solid #ddd

define: contact-card
- display: flex
- justify-content: space-between
- align-items: flex-start
- padding: 1.5em
- margin-bottom: 1em
- background-color: #f9f9f9
- border-left: 4px solid #3498db
- border-radius: 5px
- transition: box-shadow 0.2s

define: contact-info
- flex: 1

define: contact-name
- font-size: 1.3em
- font-weight: bold
- color: #2c3e50
- margin-bottom: 0.5em

define: contact-detail
- color: #555
- margin-bottom: 0.25em
- font-size: 0.95em

define: contact-notes
- color: #7f8c8d
- font-style: italic
- margin-top: 0.5em
- font-size: 0.9em

define: contact-actions
- display: flex
- gap: 0.5em
- flex-direction: column

define: edit-button
- padding: 0.5em 1em
- background-color: #f39c12
- color: white
- border: none
- border-radius: 3px
- cursor: pointer
- font-size: 0.9em

define: delete-button
- padding: 0.5em 1em
- background-color: #e74c3c
- color: white
- border: none
- border-radius: 3px
- cursor: pointer
- font-size: 0.9em

define: empty-state
- text-align: center
- padding: 3em
- color: #95a5a6

template: contact-card contact
- box:
  - styles: contact-card
  - box:
    - styles: contact-info
    - box:
      - styles: contact-name
      - text: $contact.name
    - box:
      - styles: contact-detail
      - text: 📧 $contact.email
    - box:
      - styles: contact-detail
      - text: 📞 $contact.phone
    - box:
      - styles: contact-detail
      - text: 📍 $contact.address
    - if: $contact.notes is not empty
      - box:
        - styles: contact-notes
        - text: Note: $contact.notes
  - box:
    - styles: contact-actions
    - button:
      - text: Edit
      - styles: edit-button
      - click:
        - call: startEdit $contact.id
    - button:
      - text: Delete
      - styles: delete-button
      - click:
        - call: deleteContact $contact

template: edit-contact-form contact
- box:
  - styles: form-container
  - box:
    - styles: form-title
    - text: Edit Contact
  - form:
    - styles: form-grid
    - box:
      - styles: form-full-width
      - box:
        - styles: form-label
        - text: Name
      - input:
        - id: editContactName
        - type: text
        - styles: form-input
        - value: $editContactName
    - box:
      - styles: form-full-width
      - box:
        - styles: form-label
        - text: Email
      - input:
        - id: editContactEmail
        - type: email
        - styles: form-input
        - value: $editContactEmail
    - box:
      - styles: form-label
      - text: Phone
      - input:
        - id: editContactPhone
        - type: tel
        - styles: form-input
        - value: $editContactPhone
    - box:
      - styles: form-label
      - text: Address
      - input:
        - id: editContactAddress
        - type: text
        - styles: form-input
        - value: $editContactAddress
    - box:
      - styles: form-full-width
      - box:
        - styles: form-label
        - text: Notes
      - textarea:
        - id: editContactNotes
        - styles: form-textarea
        - value: $editContactNotes
    - box:
      - styles: form-buttons
      - button:
        - text: Save
        - styles: save-button
        - click:
          - call: updateContact $contact.id form.editContactName form.editContactEmail form.editContactPhone form.editContactAddress form.editContactNotes
      - button:
        - text: Cancel
        - styles: cancel-button
        - click:
          - call: cancelEdit

ptml:
- box:
  - styles: app-container

  - box:
  - styles: app-header
  - box:
    - styles: app-title
    - text: Contact Manager
  - box:
    - styles: header-actions
    - button:
      - text: Add Contact
      - styles: add-button
      - click:
        - call: toggleAddForm

- box:
  - styles: search-container
  - input:
    - id: searchQuery
    - type: text
    - styles: search-input
    - placeholder: Search contacts by name or email...
    - value: $searchQuery
  - box:
    - styles: group-selector
    - text: Group by:
    - button:
      - text: None
      - styles: group-button
      - click:
        - call: setGroupBy none
    - button:
      - text: First Letter
      - styles: group-button
      - click:
        - call: setGroupBy firstLetter

- if: $showAddForm is true
  - box:
    - styles: form-container
    - box:
      - styles: form-title
      - text: Add New Contact
    - form:
      - styles: form-grid
      - box:
        - styles: form-full-width
        - box:
          - styles: form-label
          - text: Name *
        - input:
          - id: newContactName
          - type: text
          - styles: form-input
          - placeholder: Full name
      - box:
        - styles: form-full-width
        - box:
          - styles: form-label
          - text: Email *
        - input:
          - id: newContactEmail
          - type: email
          - styles: form-input
          - placeholder: email@example.com
      - box:
        - styles: form-label
        - text: Phone
        - input:
          - id: newContactPhone
          - type: tel
          - styles: form-input
          - placeholder: 555-0100
      - box:
        - styles: form-label
        - text: Address
        - input:
          - id: newContactAddress
          - type: text
          - styles: form-input
          - placeholder: Street address
      - box:
        - styles: form-full-width
        - box:
          - styles: form-label
          - text: Notes
        - textarea:
          - id: newContactNotes
          - styles: form-textarea
          - placeholder: Additional information...
      - box:
        - styles: form-buttons
        - button:
          - text: Add Contact
          - styles: save-button
          - click:
            - call: addContact form.newContactName form.newContactEmail form.newContactPhone form.newContactAddress form.newContactNotes
        - button:
          - text: Cancel
          - styles: cancel-button
          - click:
            - call: toggleAddForm

- box:
  - styles: contacts-container
  - box:
    - styles: contacts-header
    - box:
      - styles: contacts-title
      - text: Contacts
    - box:
      - styles: contacts-count
      - text: ($contacts.length contacts)

  - if: $groupBy is firstLetter
    - each: contacts as contact
      - if: $contact.name starts with A
        - box:
          - styles: group-header
          - text: A
        - show: contact-card $contact
      - if: $contact.name starts with B
        - box:
          - styles: group-header
          - text: B
        - show: contact-card $contact
      - if: $contact.name starts with J
        - box:
          - styles: group-header
          - text: J
        - show: contact-card $contact
  - else:
    - each: contacts as contact
      - if: $searchQuery is empty
        - if: $editingContactId is $contact.id
          - show: edit-contact-form $contact
        - else:
          - show: contact-card $contact
      - if: $contact.name contains $searchQuery
        - if: $editingContactId is $contact.id
          - show: edit-contact-form $contact
        - else:
          - show: contact-card $contact
      - if: $contact.email contains $searchQuery
        - if: $editingContactId is $contact.id
          - show: edit-contact-form $contact
        - else:
          - show: contact-card $contact

  - if: $contacts.length is 0
    - box:
      - styles: empty-state
      - text: No contacts yet. Click "Add Contact" to get started!
`;

export { contactManager };

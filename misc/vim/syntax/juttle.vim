" Vim syntax file
" Language: Juttle
" Maintainer: Matt Nibecker
" Latest Revision: 17 December 2015

if exists("b:current_syntax")
    finish
endif

syn region juttleStringD            start='"'  end='"'
syn region juttleStringS            start="'"  end="'"

syn match  juttleMoment             /\:[^;]+*\:/
syn match  juttleNumber             /\<-\=\d\+L\=\>\|\<0[xX]\x\+\>/
syn match  juttleFloat              /\<-\=\%(\d\+\.\d\+\|\d\+\.\|\.\d\+\)\%([eE][+-]\=\d\+\)\=\>/

syn keyword juttleStorage           const var
syn keyword juttleDebug             error
syn keyword juttleKeywords          export import input return 
syn keyword juttleConditional       if else
syn keyword juttleFunctions         function reducer sub

syn keyword juttleSinks             view
syn keyword juttleProcs             # ? alert batch dropped emit fields filter head join keep
syn keyword juttleProcs             keep pace pass put read reduce remove skip sort source
syn keyword juttleProcs             spaces split tail unbatch uniq write
syn keyword juttleConst             false null true

syn region  juttleLineComment       start=+\/\/+ end=/$/ oneline
syn region  juttleComment           start="/\*" end="\*/" contains=juttleLineComment 

hi def link juttleStringD               String
hi def link juttleStringS               String
hi def link juttleMoment                String
hi def link juttleNumber                Number
hi def link juttleFloat                 Number

hi def link juttleLineComment           Comment
hi def link juttleComment               Comment
hi def link juttleStorage               StorageClass
hi def link juttleDebug                 Debug
hi def link juttleKeywords              Statement
hi def link juttleConditional           Conditional
hi def link juttleFunctions             Function
hi def link juttleProcs                 Keyword
hi def link juttleSinks                 Keyword
hi def link juttleConst                 Constant

let b:current_syntax = "juttle"

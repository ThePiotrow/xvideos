export function Container({ isOpen, children }) {
    return (
        <>
            <div className={`mx-5 pb-20 relative ${isOpen ? 'overflow-hidden h-screen' : ''}`}>
                <div className={`2xl:max-w-7xl lg:max-w-3xl md:max-w-2xl max-w-md mx-auto flex flex-col-reverse `}>
                    {children}
                </div>


            </div>
            <div className={`bg-slate-900 absolute top-0 bottom-0 left-0 right-0 lg:invisible ${isOpen ? 'visible' : 'invisible'}`}>

            </div>
        </>
    )
}
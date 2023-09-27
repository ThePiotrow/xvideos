export function Container({ children }) {
    return (

        <div className="mx-5">
            <div className="2xl:max-w-7xl lg:max-w-3xl md:max-w-2xl max-w-md mx-auto">
                {children}
            </div>
        </div>
    )
}
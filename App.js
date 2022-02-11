import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, Button, Image, Dimensions, TextInput, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Cell, Section, TableView } from 'react-native-tableview-simple';
import { useState, useCallback, useEffect } from 'react';
import React from 'react';
import { LogBox } from 'react-native';

// ignore this warning as it is safe given we are not using state persistence or deep linking
LogBox.ignoreLogs([
 'Non-serializable values were found in the navigation state',
]);

const Stack = createStackNavigator();
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const gelatoMenu = {
  items: [
    { "title":"Gelato", "contents":[
                            {"title":"Vanilla", "price":"2.50"},
                            {"title":"Chocolate", "price":"2.50"},
                            {"title":"Strawberry", "price":"2.50"}
                          ]
    },
    { "title":"Coffee", "contents":[
                            {"title":"Flat White", "price":"1.50"},
                            {"title":"Americano", "price":"1.20"},
                            {"title":"Latte", "price":"1.50"}
                          ]
    }
  ]
};

const burgerMenu = {
  items: [
    { "title":"Burgers", "contents":[
                            {"title":"Cheeseburger", "price":"5.00"},
                            {"title":"Bacon Cheeseburger", "price":"6.00"},
                            {"title":"Double Cheeseburger", "price":"8.50"}
                          ]
    },
    { "title":"Sides", "contents":[
                            {"title":"French Fries", "price":"2.50"},
                            {"title":"Onion Rings", "price":"3.00"},
                            {"title":"Salad", "price":"3.00"}
                          ]
    },
    { "title":"Drinks", "contents":[
                            {"title":"Coca-Cola", "price":"1.50"},
                            {"title":"Sprite", "price":"1.50"},
                            {"title":"Fanta", "price":"1.50"}
                          ]
    }
  ]
}

const HomescreenCell  = (props) => {
  let stars = [];
  for (let i=0; i<props.stars; i++) {
    stars.push(
      <Image style={styles.star} source={require('./assets/star.png')} key={i} />
    );
  }
  return (
      <Cell
        {...props}
        highlightUnderlayColor="#ccc"
        height="290px"
        cellContentView={
          <View style={styles.restaurantCell}>
            <Image source={props.imgUri} style={styles.restarauntImg}/>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={styles.restaurantTitle}>{props.title}</Text>
              {stars}
            </View>
            <Text style={styles.restaurantTagline}>{props.tagline}</Text>
            <View style={styles.restaurantETA}>
              <Text style={styles.ETATxt}>{props.eta} mins</Text>
            </View>
          </View>
        }
        onPress={props.action}
      />
  );
}

const HomeScreen = ({navigation}) => {
  return (
    <SafeAreaView style={{flex: 1}}>
      <ScrollView>
          <TableView>
            <Section header="" hideSeparator={true} separatorTintColor={'#ccc'}>
              <HomescreenCell
                title="Joe's Gelato"
                tagline="Desert, Ice cream, £££"
                eta="10-30"
                stars={5}
                imgUri={require('./assets/ice-cream-header.jpg')}
                action={()=>navigation.navigate(
                  "Menu",
                  gelatoMenu
                )}
              />
              <HomescreenCell
                title="Best Burgers"
                tagline="Western, Steak, £££"
                eta="30-60"
                stars={4}
                imgUri={require('./assets/burger-header.jpg')}
                action={()=>navigation.navigate(
                  "Menu",
                  burgerMenu
                )}
              />
            </Section>
          </TableView>
      </ScrollView>
    </SafeAreaView>
  );
}

const MenuCell = (props) => {
  const [quantity, setQuantity] = useState("0");
  const quantityHandler = (e) => {
    setQuantity(e.text);
  }
  return (
    <Cell
      {...props}
      cellContentView={
        <View style={styles.MenuCell}>
          <View style={{flexDirection:"row"}}>
            <Text style={styles.price}>£{props.price}</Text>
            <Text>{props.customLabel}</Text>
          </View>
          <View style={styles.AddToCart}>
            <TextInput placeholder="0" value={quantity} onChangeText={text => quantityHandler({ text })}/>
            <Button
              title="Add to cart"
              onPress={()=>props.addToCartFunction(props.customLabel + " " + props.itemGroup, quantity, props.price,)}
              disabled={parseInt(quantity) > 0 ? false : true}
            />
          </View>
        </View>
      }
    />
  );
}

const MenuScreen = ({route, navigation}) => {
  const {items} = route.params;
  const [cart, setCart] = useState([]);
  const [orderTotal, setOrderTotal] = useState(0);

  const updateTotal = (updatedCart) => {
    let newTotal = 0;
    updatedCart.forEach((item)=>{
      newTotal += item.quantity * item.price;
    });
    setOrderTotal(newTotal);
  }

  const addToCartHandler = (item, quantity, price) => {
    if (quantity > 0) {
      let newItem = {item: item, quantity: parseInt(quantity), price: parseFloat(price)};
      let newCart = [...cart];

      // check if already have the item in the cart
      // if yes, increment the quantity, else add the new item
      let itemFound = false;
      let foundIndex;
      newCart.forEach((item, i)=>{
        if (item.item === newItem.item) {
          itemFound = true;
          foundIndex = i;
        }
      })
      if (itemFound) {
        newCart[foundIndex].quantity += newItem.quantity;
      } else {
          newCart.push(newItem);
      }

      setCart(newCart);
      updateTotal(newCart);
    }
  }

  // remove items from cart handler, passed to cart page.
  // It is safe to pass this function (non JSON serializable) in navigate as we are not using state persistence or deep linking
  // if we want to introduce those features we would need to customize the back button to pass the new cart state back
  const removeFromCartHandler = useCallback((cart, index) => {
    cart.splice(index, 1);
    setCart(cart);
    updateTotal(cart);
  });

  return (
    <SafeAreaView style={{flex: 1}}>
      <ScrollView>
        <Text style={styles.orderTotal}>Order total: </Text>
        <Text style={styles.orderTotal}>£{orderTotal.toFixed(2)}</Text>
        <Button title="View Cart" onPress={()=>navigation.navigate("Cart", {cart, orderTotal, removeFromCartHandler})}/>
        <TableView>
          {items.map((section, i) => (
            <Section header={section.title} key={i}>
              {section.contents.map((cell, i)  => (
                <MenuCell
                  itemGroup = {section.title}
                  customLabel={cell.title}
                  price={cell.price}
                  key={i}
                  addToCartFunction={addToCartHandler}
                />
              ))}
            </Section>
          ))}
        </TableView>
      </ScrollView>
    </SafeAreaView>
  );
}

const CartCell = (props) => (
  <Cell
    {...props}
    cellContentView={
      <View style={styles.cartList}>
        <View>
          <Text>{props.quantity} x {props.item}</Text>
          <Text>£{(props.price * props.quantity).toFixed(2)}</Text>
        </View>
        <View>
          <Button style={styles.removeBtn} title="Remove" onPress={()=>props.removeFromCartFunction(props.cart, props.index)} />
        </View>
      </View>
    }
  />
)

const CartScreen = ({route, navigation}) => {
  const {cart, orderTotal, removeFromCartHandler} = route.params;
  const [cartState, setCartState] = useState([]);
  const [orderTotalState, setOrderTotalState] = useState(0);

  // when component loads, set the cart and order total state
  useEffect(()=>{
    setCartState(cart);
    setOrderTotalState(orderTotal);
  }, []);

  // update cart state function when remove items from cart
  const updateCart = (cart, index) => {
    let oldCart = [...cart];
    // update state on cart page
    cart.splice(index, 1);
    setCartState(cart);
    let newTotal = 0;
    cart.forEach((item)=>{
      newTotal += item.quantity * item.price;
    });
    setOrderTotalState(newTotal);
    // update state on menu page
    removeFromCartHandler(oldCart, index);
  }

  const cartCells = cartState.map((cell, i)  => (
    <CartCell
      item={cell.item}
      price={cell.price}
      quantity={cell.quantity}
      key={i}
      removeFromCartFunction={updateCart}
      cart={cartState}
      index={i}
    />
  ));
  const noItems = (
    <Cell title="No items in your cart." />
  )

  return (
    <SafeAreaView style={{flex: 1}}>
      <ScrollView>
        <TableView>
          <Section header="Items">
            {cartState.length > 0 ? cartCells : noItems}
          </Section>
          <Section header="Total">
            <Cell title={"£"+orderTotalState.toFixed(2)}/>
          </Section>
          <Section header="Place Order">
            <Button title="Order Now" disabled={cartState.length > 0 ? false : true}/>
          </Section>
        </TableView>
      </ScrollView>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Restaurants" component={HomeScreen} />
        <Stack.Screen name="Menu" component={MenuScreen} />
        <Stack.Screen name="Cart" component={CartScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  restaurantCell: {
    backgroundColor: 'lightgrey'
  },
  restarauntImg: {
    width: windowWidth*0.93,
    height: 290
  },
  star: {
    height: 20,
    width: 20
  },
  restaurantTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    padding: 5
  },
  restaurantTagline: {
    fontSize: 16,
    color: 'black',
    paddingBottom: 5,
    paddingLeft: 5
  },
  restaurantETA: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 70,
    height: 50,
    borderRadius: 50,
    backgroundColor: 'white',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5
  },
  ETATxt: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  MenuCell: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  AddToCart: {
    flexDirection: 'row'
  },
  price: {
    width: 50
  },
  orderTotal: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold'
  },
  cartList: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  removeBtn: {
    width: 50
  }
});
